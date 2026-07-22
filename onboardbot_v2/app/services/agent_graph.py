import os
from dotenv import load_dotenv
load_dotenv() # Load env vars from .env file

from typing import TypedDict, List, Dict, Any, Literal, Optional
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END


# Automatically uses GROQ_API_KEY from environment variables
llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.0, max_tokens=1024)

class LeaveRequestCheck(BaseModel):
    is_leave_request: bool = Field(description="True if the user wants to request leave.")



class OnboardState(TypedDict):
    messages: List[Dict[str, str]]
    employee_id: str
    employee_meta: Dict[str, Any]
    next_node: str
    provisioning_payload: Dict[str, Any]
    risk_flag: bool
    compliance_passed: bool

class RoutingDecision(BaseModel):
    next_node: Literal["knowledge_rag", "it_provisioner", "conversational"] = Field(
        description="Choose 'knowledge_rag' for policy, handbook, benefits, leave, core hours, or general HR questions. "
                    "Choose 'it_provisioner' for access, accounts, software setup, Slack, GitHub, or provisioning. "
                    "Choose 'conversational' for general greetings, chit-chat, introductions, or questions not related to HR policy/IT."
    )
    reasoning: str = Field(description="Reason for the routing decision.")

def supervisor_router(state: OnboardState) -> Dict[str, Any]:
    last_msg = state["messages"][-1]["content"]
    if last_msg.startswith("ACTION:SUBMIT_LEAVE|") or last_msg.startswith("ACTION:SUBMIT_DOC|") or last_msg.startswith("ACTION:SUBMIT_SIGNATURE|"):
        return {"next_node": "knowledge_rag"}
    if last_msg.startswith("ACTION:SUBMIT_IT|") or last_msg.startswith("ACTION:SUBMIT_HARDWARE|"):
        return {"next_node": "it_provisioner"}
        
    try:
        structured_llm = llm.with_structured_output(RoutingDecision)
        prompt = (
            "You are a routing assistant. Analyze the user message and route it to the correct node based on its purpose.\n\n"
            f"User message: {last_msg}"
        )
        decision = structured_llm.invoke(prompt)
        return {"next_node": decision.next_node}
    except Exception:
        text = last_msg.lower()
        if any(k in text for k in ["setup", "account", "slack", "provision"]): return {"next_node": "it_provisioner"}
        if any(k in text for k in ["policy", "leave", "insurance"]): return {"next_node": "knowledge_rag"}
        return {"next_node": "conversational"}

def knowledge_rag_node(state: OnboardState) -> Dict[str, Any]:
    query = state["messages"][-1]["content"]
    
    # 0. Check for Form Submission
    if query.startswith("ACTION:SUBMIT_LEAVE|"):
        try:
            parts = query.split("|")
            days = parts[1].split(":")[1]
            reason = parts[2].split(":")[1]
            return {
                "messages": state["messages"] + [{"sender": "knowledge_rag", "content": f"I've logged your request for {days} due to {reason}. Sending to HR for approval."}],
                "risk_flag": True,
                "provisioning_payload": {"req": f"Leave Request: {days} for {reason}"},
                "next_node": "compliance_auditor"
            }
        except Exception as e:
            print(f"[Form Parse Error] {e}")

    # 1. Check if this is a leave request flow
    try:
        structured_llm = llm.with_structured_output(LeaveRequestCheck)
        history_str = "\n".join([f"{msg['sender']}: {msg['content']}" for msg in state["messages"]])
        
        prompt_check = (
            "You are an HR leave processor. Analyze the conversation history below.\n"
            "Determine if the user is requesting leave.\n\n"
            f"Conversation History:\n{history_str}\n\n"
            "Return the structured evaluation."
        )
        check = structured_llm.invoke(prompt_check)
        
        if check.is_leave_request:
            return {
                "messages": state["messages"] + [{"sender": "knowledge_rag", "content": "WIDGET:LEAVE_FORM"}],
                "risk_flag": False,
                "next_node": "compliance_auditor"
            }
    except Exception as e:
        print(f"[Leave Flow Exception] {e}")
        
    # 2. Otherwise, run standard RAG query resolver
    context_mock = (
        "Document Ref: Enterprise_Onboarding_Handbook.pdf\n"
        "- HR Contacts: Sarah Jenkins is the primary HR Contact (email: s.jenkins@company.com).\n"
        "- Core Hours: Standard working core hours are 10:00 AM to 4:00 PM.\n"
        "- Leave Requests: Request leave using the Quick Actions sidebar button or type a leave request message to this bot. Parental leave scales up to 16 weeks of paid time off.\n"
        "- IT Help & Software Provisioning: For Slack, GitHub, or hardware accounts, ask the chatbot to trigger a provisioning ticket. General IT support can be contacted via the 'IT Help' sidebar button.\n"
        "- Required Documents: Onboarding requires a signed employment contract, direct deposit form, and government-issued ID verification.\n"
        "- Benefits & Wellness: Comprehensive medical, dental, and vision health insurance. 401(k) matching up to 4%. Annual wellness stipend."
    )
    
    # Strict anti-hallucination prompt based on enterprise requirements
    prompt = (
        f"You are an onboarding assistant. Answer this HR/company query using ONLY the provided context. Context:\n{context_mock}\n\n"
        f"Query: {query}\n\n"
        f"IMPORTANT: If the context does not explicitly contain the answer, reply ONLY with: "
        f"'I don't have that information. Please contact HR at support@luminasystems.com'."
    )
    
    response = llm.invoke(prompt)
    return {"messages": state["messages"] + [{"sender": "knowledge_rag", "content": response.content}], "next_node": "compliance_auditor"}

def it_provisioner_node(state: OnboardState) -> Dict[str, Any]:
    query = state["messages"][-1]["content"]
    
    # 0. Check for Form Submission
    if query.startswith("ACTION:SUBMIT_IT|"):
        try:
            parts = query.split("|")
            tools = parts[1].split(":")[1]
            return {
                "messages": state["messages"] + [{"sender": "it_provisioner", "content": f"I've registered your request for access to: {tools}. Escalating to HR for approval."}],
                "risk_flag": True,
                "provisioning_payload": {"req": f"IT Provisioning: {tools}"},
                "next_node": "compliance_auditor"
            }
        except Exception as e:
            print(f"[IT Form Parse Error] {e}")

    if query.startswith("ACTION:SUBMIT_HARDWARE|"):
        try:
            return {
                "messages": state["messages"] + [{"sender": "it_provisioner", "content": "Your hardware equipment request has been logged and sent to HR/IT Procurement for processing."}],
                "risk_flag": True,
                "provisioning_payload": {"req": query.replace("ACTION:SUBMIT_HARDWARE|", "Hardware Order: ")},
                "next_node": "compliance_auditor"
            }
        except Exception as e:
            print(f"[Hardware Parse Error] {e}")

    # 1. Trigger the form widget
    return {
        "messages": state["messages"] + [{"sender": "it_provisioner", "content": "WIDGET:IT_PROVISION_FORM"}],
        "risk_flag": False,
        "next_node": "compliance_auditor"
    }

def conversational_node(state: OnboardState) -> Dict[str, Any]:
    query = state["messages"][-1]["content"]
    response = llm.invoke([
        SystemMessage(content="You are Prism, an enterprise onboarding assistant for Lumina Systems. Provide a helpful, concise response."),
        HumanMessage(content=query)
    ])
    return {"messages": state["messages"] + [{"sender": "conversational", "content": response.content}], "next_node": "compliance_auditor"}

def compliance_auditor(state: OnboardState) -> Dict[str, Any]:
    return {"compliance_passed": True, "next_node": END}

workflow = StateGraph(OnboardState)
workflow.add_node("supervisor", supervisor_router)
workflow.add_node("knowledge_rag", knowledge_rag_node)
workflow.add_node("it_provisioner", it_provisioner_node)
workflow.add_node("conversational", conversational_node)
workflow.add_node("compliance_auditor", compliance_auditor)

workflow.set_entry_point("supervisor")
workflow.add_conditional_edges("supervisor", lambda state: state["next_node"], {
    "knowledge_rag": "knowledge_rag", "it_provisioner": "it_provisioner", "conversational": "conversational"
})
workflow.add_edge("knowledge_rag", "compliance_auditor")
workflow.add_edge("it_provisioner", "compliance_auditor")
workflow.add_edge("conversational", "compliance_auditor")
workflow.add_edge("compliance_auditor", END)

agent_graph = workflow.compile()
