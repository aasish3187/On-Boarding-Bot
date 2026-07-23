import os
from dotenv import load_dotenv
load_dotenv() # Load env vars from .env file

from typing import TypedDict, List, Dict, Any, Literal, Optional
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END


# Automatically uses GROQ_API_KEY from environment variables
llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.1, max_tokens=2048)

# ============================================================
# ENTERPRISE KNOWLEDGE BASE
# ============================================================
ENTERPRISE_KNOWLEDGE = """
=== LUMINA SYSTEMS - ENTERPRISE ONBOARDING KNOWLEDGE BASE ===

--- COMPANY OVERVIEW ---
Lumina Systems is a leading enterprise software company founded in 2018, headquartered in San Francisco, CA.
Mission: To build intelligent automation tools that empower modern businesses.
Values: Innovation, Transparency, Collaboration, Customer-First, Continuous Learning.
Website: www.luminasystems.com | General Inquiries: info@luminasystems.com

--- OFFICE LOCATIONS & MAP ---
Headquarters: 1200 Market Street, San Francisco, CA 94103
- Floor B1: Cafeteria, Gym, Recreation Lounge, Bike Storage
- Floor 1: Reception, HR Department, Conference Rooms A-D, Visitor Lounge
- Floor 2: Design & Product Team, UX Lab, Presentation Theater
- Floor 3: Engineering Department, Server Room, Innovation Lab
- Floor 4: Executive Offices, Board Room, Legal & Finance
- Floor 5: Sales & Marketing, Customer Success, Rooftop Terrace

Branch Offices:
- New York: 350 Fifth Avenue, Suite 4200, NY 10118
- London: 25 Old Broad Street, London EC2N 1HN
- Bangalore: Prestige Tech Park, Outer Ring Road, Bangalore 560103

--- TEAM STRUCTURE & CONTACTS ---
Engineering Team:
  - VP of Engineering: Michael Torres (m.torres@luminasystems.com, Ext: 3001)
  - Engineering Manager: Priya Sharma (p.sharma@luminasystems.com, Ext: 3010)
  - Tech Lead (Backend): James Chen (j.chen@luminasystems.com, Ext: 3015)
  - Tech Lead (Frontend): Emma Rodriguez (e.rodriguez@luminasystems.com, Ext: 3020)
  - DevOps Lead: Kevin Park (k.park@luminasystems.com, Ext: 3025)
  
Design Team:
  - Head of Design: Lisa Wang (l.wang@luminasystems.com, Ext: 2001)
  - UX Research Lead: Sam Patel (s.patel@luminasystems.com, Ext: 2010)

HR Department:
  - HR Director: Sarah Jenkins (s.jenkins@luminasystems.com, Ext: 1001)
  - HR Coordinator: David Martinez (d.martinez@luminasystems.com, Ext: 1010)
  - Recruiter: Amy Foster (a.foster@luminasystems.com, Ext: 1015)

Sales & Marketing:
  - VP Sales: Robert Kim (r.kim@luminasystems.com, Ext: 4001)
  - Marketing Lead: Nicole Adams (n.adams@luminasystems.com, Ext: 4010)

--- COMMUNICATION TOOLS ---
Internal Messaging: Slack (workspace: luminasystems.slack.com)
  Key Channels: #general, #engineering, #design, #random, #announcements, #new-hires, #tech-support
Video Conferencing: Google Meet (primary), Zoom (external meetings)
  - To schedule: Use Google Calendar. All employees get a personal Google Meet link.
  - Zoom Pro license available upon request from IT.
Phone System: RingCentral (desk phones + mobile app)
  - Dial 9 + extension for internal calls
  - IT Help Desk direct line: Ext 5555 or +1-415-555-5555
  - Voicemail setup: Dial *86 from your desk phone
Email: Google Workspace (firstname.lastname@luminasystems.com)
Project Management: Jira (jira.luminasystems.com) and Confluence for documentation.

--- HR POLICIES ---
Working Hours:
  - Core hours: 10:00 AM to 4:00 PM (local time). Flexible start/end outside core hours.
  - Standard work week: 40 hours, Monday through Friday.
  - Overtime requires manager pre-approval.

Leave Policy:
  - Paid Time Off (PTO): 20 days per year (accrues monthly).
  - Sick Leave: 10 days per year (no doctor's note needed for 1-2 days).
  - Parental Leave: 16 weeks paid (birth parent), 8 weeks paid (non-birth parent).
  - Bereavement: 5 days for immediate family, 3 days for extended family.
  - Jury Duty: Fully paid for the duration.
  - Personal Leave: Up to 30 days unpaid (manager + HR approval required).
  - To request leave: Use the "Request Leave" button in the sidebar or type "I want to request leave."

Remote Work:
  - Hybrid model: 3 days in-office (Tue/Wed/Thu), 2 days remote (Mon/Fri).
  - Fully remote exceptions require VP-level approval.
  - Home office stipend: $500 one-time for equipment setup.

Dress Code: Business casual. No formal suits required. Engineering teams may dress casually.

Expense Policy:
  - Meals during overtime/travel: Up to $50/day reimbursable.
  - Travel: Book via Concur. Flights must be economy for domestic, business for international 6h+.
  - Submit expense reports within 30 days of incurring the expense.

--- BENEFITS & WELLNESS ---
Health Insurance: Comprehensive medical, dental, and vision through Aetna.
  - Employee-only: Fully covered by company.
  - Employee + family: 80% covered, 20% employee contribution.
Retirement: 401(k) with company match up to 4% of salary.
Wellness Stipend: $1,200/year for gym, fitness apps, mental health services.
Learning & Development: $2,000/year for courses, conferences, certifications.
Gym: On-site gym (Floor B1) with showers and lockers. Open 6 AM - 10 PM.
Employee Assistance Program (EAP): Free confidential counseling (24/7 hotline: 1-800-555-0199).
Commuter Benefits: Pre-tax transit/parking benefits via WageWorks.

--- IT & SECURITY ---
VPN: Cisco AnyConnect. Required for accessing internal services remotely.
  - Download: vpn.luminasystems.com, credentials = your LDAP login.
Two-Factor Authentication (2FA): Required for all systems. Use Google Authenticator or Yubikey.
Password Policy: Minimum 12 characters, must include uppercase, lowercase, number, symbol. Rotate every 90 days.
GitHub Organization: github.com/lumina-systems (request access via IT).
CI/CD: GitHub Actions for all repositories. Deployments via ArgoCD.
Jira Boards: Each team has a dedicated board. Sprint cadence: 2-week sprints.
Security Incidents: Report to security@luminasystems.com or call Ext 5500 immediately.
Laptop/Equipment: Company-issued MacBook Pro or Dell XPS. Return upon exit.

--- ONBOARDING MILESTONES ---
Week 1 (Days 1-5):
  - Complete HR paperwork and document uploads.
  - Set up IT accounts (Slack, GitHub, Jira, Email, VPN).
  - Meet your onboarding buddy and team lead.
  - Attend "Welcome to Lumina" orientation session.

Week 2-4 (Days 6-30):
  - Complete mandatory compliance training modules.
  - Shadow team members on active projects.
  - Set up your local development environment.
  - First 1:1 with your manager.

Month 2 (Days 31-60):
  - Begin contributing to a starter project or bug fixes.
  - Attend a cross-functional team meeting.
  - Complete security awareness training.

Month 3 (Days 61-90):
  - Take ownership of a feature or initiative.
  - 90-day review with your manager.
  - Provide feedback on the onboarding experience.

Required Documents: Signed employment contract, W-4 tax form, direct deposit form, government-issued photo ID, emergency contact information.

--- PROJECT SUBMISSION, CODE STANDARDS & MNC WORKFLOWS ---
Agile/Scrum Process:
  - Daily Standup: Held daily at 10:00 AM PT via Google Meet. Report: 1) What you did yesterday, 2) What you will do today, 3) Any blockers.
  - Sprint Planning: Bi-weekly on Mondays. Sprints are 2 weeks long. Story points are estimated using Fibonacci sequence (1, 2, 3, 5, 8).
  - Sprint Retrospective: Bi-weekly on Fridays. Team discusses what went well, what could be improved, and action items.
  - Jira Tickets: Every task must have a Jira ticket (e.g., ENG-123). Transitions: Backlog -> To Do -> In Progress -> In Review -> QA -> Done.

Git Workflow & PR Process:
  1. Create a feature branch from 'main': git checkout -b feature/ENG-123-your-feature-name
  2. Write code following clean code principles (SOLID, DRY) and team style guides (ESLint/Prettier for JS, Black/Flake8 for Python).
  3. Write tests. Minimum 80% coverage required. Run tests locally using `pytest` or `npm test`.
  4. Push branch and open a Pull Request (PR) on GitHub.
  5. Title PR as "ENG-123: Feature description". Provide a clear summary and screenshots of changes.
  6. Request reviews from at least 2 team members. Address review comments and obtain approvals.
  7. Once approved and CI/CD checks pass, perform a "Squash and Merge".

Code Review & Quality Checklist:
  - Code Quality: Ensure proper naming conventions, clean functions, modular design, and no dead code.
  - Testing: Verify unit and integration tests are present and passing.
  - Security: Absolutely no hardcoded secrets, API keys, or credentials. Use environment variables.
  - Performance: Optimize SQL queries, avoid N+1 query patterns, and ensure efficient memory usage.
  - Error Handling: Use proper try/catch blocks and logging (avoid silent failures).

CI/CD & Deployment Pipeline:
  - CI: Every commit triggers GitHub Actions to run linters, tests, and build checks.
  - CD: Successful merges to 'main' automatically deploy to the Staging environment via ArgoCD.
  - Production Release: Weekly on Tuesdays at 2:00 PM PT. Requires manager sign-off.
  - Rollbacks: Triggered via ArgoCD with a single-click revert.

MNC Developer Setup & Troubleshooting:
  - Local setup: Run `docker-compose up -d` to spin up local database (PostgreSQL/Redis) and caching services.
  - Common Docker commands: `docker ps` (list containers), `docker logs -f <id>` (tail logs), `docker exec -it <id> sh` (exec shell).
  - Git troubleshooting: `git merge main` (sync branch), `git stash` (save work temporarily), `git reset --hard HEAD` (discard local changes).
  - Database queries: Ensure indexes are created on frequently filtered columns. Use EXPLAIN ANALYZE to debug slow SQL queries.
  - API Standards: Follow RESTful design. Use correct HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Internal Server Error).

"""

# ============================================================
# STATE & SCHEMA DEFINITIONS
# ============================================================

class OnboardState(TypedDict):
    messages: List[Dict[str, str]]
    employee_id: str
    employee_meta: Dict[str, Any]
    next_node: str
    provisioning_payload: Dict[str, Any]
    risk_flag: bool
    compliance_passed: bool

class RoutingDecision(BaseModel):
    next_node: Literal[
        "knowledge_rag",
        "it_provisioner",
        "general_assistant",
        "guardrail_blocked"
    ] = Field(
        description=(
            "Route to 'knowledge_rag' for HR policies, leave requests, benefits, compliance, onboarding process, or required documents. "
            "Route to 'it_provisioner' ONLY when the user wants to SET UP, PROVISION, or ORDER IT accounts, software access, or hardware equipment. "
            "Route to 'general_assistant' for code help, debugging, project submission questions, team info, office directions, video call setup, phone numbers, general knowledge, or any other work-related question. "
            "Route to 'guardrail_blocked' for personal advice (dating, relationships), offensive/harmful content, political opinions, medical/legal advice, or anything clearly inappropriate for a workplace assistant."
        )
    )
    reasoning: str = Field(description="Brief reason for the routing decision.")

class LeaveIntentCheck(BaseModel):
    wants_to_take_leave: bool = Field(
        description=(
            "True ONLY if the user explicitly wants to REQUEST or SUBMIT a leave application right now. "
            "False if they are just ASKING ABOUT leave policy, how leave works, how many days they have, or any informational question about leave."
        )
    )

# ============================================================
# SUPERVISOR ROUTER
# ============================================================

def supervisor_router(state: OnboardState) -> Dict[str, Any]:
    last_msg = state["messages"][-1]["content"]
    
    # Direct action routing for form submissions (bypass LLM)
    if last_msg.startswith("ACTION:SUBMIT_LEAVE|") or last_msg.startswith("ACTION:SUBMIT_DOC|") or last_msg.startswith("ACTION:SUBMIT_SIGNATURE|"):
        return {"next_node": "knowledge_rag"}
    if last_msg.startswith("ACTION:SUBMIT_IT|") or last_msg.startswith("ACTION:SUBMIT_HARDWARE|"):
        return {"next_node": "it_provisioner"}
        
    try:
        structured_llm = llm.with_structured_output(RoutingDecision)
        
        # Build recent conversation context for better routing
        recent_msgs = state["messages"][-5:]
        history_str = "\n".join([f"{msg['sender']}: {msg['content']}" for msg in recent_msgs])
        
        prompt = (
            "You are a routing assistant for an enterprise onboarding chatbot at Lumina Systems.\n"
            "Analyze the user's latest message in context and route it to the correct handler.\n\n"
            "CRITICAL RULES:\n"
            "- If the user asks ABOUT policies, benefits, leave rules, or onboarding info -> 'knowledge_rag'\n"
            "- If the user wants to REQUEST leave, submit documents, or handle HR forms -> 'knowledge_rag'\n"
            "- If the user wants to SET UP accounts, request software access, or order hardware -> 'it_provisioner'\n"
            "- If the user asks for code help, debugging, team contacts, office directions, meeting setup, "
            "phone numbers, project submission, git workflow, or any general work question -> 'general_assistant'\n"
            "- If the user asks personal questions (dating, relationships), offensive content, "
            "political opinions, or inappropriate requests -> 'guardrail_blocked'\n\n"
            f"Conversation:\n{history_str}\n\n"
            f"Latest message to route: {last_msg}"
        )
        decision = structured_llm.invoke(prompt)
        return {"next_node": decision.next_node}
    except Exception as e:
        print(f"[Router Exception] {e}")
        # Keyword-based fallback
        text = last_msg.lower()
        if any(k in text for k in ["setup", "account", "slack", "provision", "hardware", "laptop"]):
            return {"next_node": "it_provisioner"}
        if any(k in text for k in ["policy", "leave", "insurance", "benefit", "pto", "sick", "parental"]):
            return {"next_node": "knowledge_rag"}
        return {"next_node": "general_assistant"}

# ============================================================
# KNOWLEDGE RAG NODE (HR Policies, Leave, Benefits)
# ============================================================

def knowledge_rag_node(state: OnboardState) -> Dict[str, Any]:
    query = state["messages"][-1]["content"]
    
    # Handle form submissions
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

    if query.startswith("ACTION:SUBMIT_DOC|"):
        try:
            filename = query.split("|")[1].split(":")[1]
            return {
                "messages": state["messages"] + [{"sender": "knowledge_rag", "content": f"Document '{filename}' has been uploaded and logged. HR will verify it within 1-2 business days."}],
                "risk_flag": False,
                "next_node": "compliance_auditor"
            }
        except Exception as e:
            print(f"[Doc Parse Error] {e}")

    if query.startswith("ACTION:SUBMIT_SIGNATURE|"):
        return {
            "messages": state["messages"] + [{"sender": "knowledge_rag", "content": "Your digital signature has been recorded and attached to the Employee NDA & Policy Agreement. A copy will be emailed to you."}],
            "risk_flag": False,
            "next_node": "compliance_auditor"
        }

    # Check if user wants to TAKE leave (not just ask about it)
    text_lower = query.lower()
    leave_action_keywords = ["request leave", "apply for leave", "take leave", "take time off", 
                             "take days off", "book leave", "submit leave", "want leave",
                             "need leave", "i want to request leave", "apply for pto"]
    
    is_leave_action = any(kw in text_lower for kw in leave_action_keywords)
    
    if is_leave_action:
        # Double-check with LLM for edge cases
        try:
            structured_llm = llm.with_structured_output(LeaveIntentCheck)
            check = structured_llm.invoke(
                f"The user said: '{query}'\n\n"
                "Is the user explicitly trying to REQUEST/SUBMIT a leave application right now? "
                "Or are they just asking about how leave works, leave policy, or how many days they have? "
                "Only return true if they clearly want to file a leave request."
            )
            if check.wants_to_take_leave:
                return {
                    "messages": state["messages"] + [{"sender": "knowledge_rag", "content": "WIDGET:LEAVE_FORM"}],
                    "risk_flag": False,
                    "next_node": "compliance_auditor"
                }
        except Exception as e:
            print(f"[Leave Intent Check Exception] {e}")

    # Standard RAG: answer from enterprise knowledge base
    history_str = "\n".join([f"{msg['sender']}: {msg['content']}" for msg in state["messages"][-6:]])
    
    prompt = (
        "You are OnboardBot, a professional HR assistant at Lumina Systems. "
        "Answer the employee's question using the enterprise knowledge base below.\n\n"
        f"=== KNOWLEDGE BASE ===\n{ENTERPRISE_KNOWLEDGE}\n\n"
        f"=== CONVERSATION HISTORY ===\n{history_str}\n\n"
        f"=== CURRENT QUESTION ===\n{query}\n\n"
        "INSTRUCTIONS:\n"
        "- Answer accurately and helpfully using the knowledge base.\n"
        "- If the exact answer is not in the knowledge base, provide the best related information and suggest who to contact.\n"
        "- Be concise but thorough. Use bullet points for lists.\n"
        "- Do NOT use emojis. Keep the tone professional.\n"
        "- Do NOT make up information not present in the knowledge base.\n"
        "- If the user asks about leave POLICY (not requesting leave), explain the policy details."
    )
    
    response = llm.invoke(prompt)
    return {
        "messages": state["messages"] + [{"sender": "knowledge_rag", "content": response.content}],
        "next_node": "compliance_auditor"
    }

# ============================================================
# IT PROVISIONER NODE
# ============================================================

def it_provisioner_node(state: OnboardState) -> Dict[str, Any]:
    query = state["messages"][-1]["content"]
    
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

    # Trigger the IT provisioning form widget
    return {
        "messages": state["messages"] + [{"sender": "it_provisioner", "content": "WIDGET:IT_PROVISION_FORM"}],
        "risk_flag": False,
        "next_node": "compliance_auditor"
    }

# ============================================================
# GENERAL ASSISTANT NODE (Code Help, Team Info, Office, etc.)
# ============================================================

def general_assistant_node(state: OnboardState) -> Dict[str, Any]:
    query = state["messages"][-1]["content"]
    
    history_str = "\n".join([f"{msg['sender']}: {msg['content']}" for msg in state["messages"][-8:]])
    
    prompt = (
        "You are OnboardBot, a highly capable enterprise assistant at Lumina Systems. "
        "You help employees with a wide range of work-related tasks.\n\n"
        f"=== ENTERPRISE KNOWLEDGE BASE ===\n{ENTERPRISE_KNOWLEDGE}\n\n"
        f"=== CONVERSATION HISTORY ===\n{history_str}\n\n"
        f"=== EMPLOYEE QUESTION ===\n{query}\n\n"
        "INSTRUCTIONS:\n"
        "- You are a knowledgeable assistant. Answer the question thoroughly and helpfully.\n"
        "- For CODE HELP: Review the code, identify issues, explain the fix, and provide corrected code.\n"
        "- For TEAM/CONTACT questions: Provide names, emails, phone extensions from the knowledge base.\n"
        "- For OFFICE/LOCATION questions: Provide floor information and directions from the knowledge base.\n"
        "- For VIDEO CALL/MEETING questions: Explain how to use Google Meet, Zoom, or schedule meetings.\n"
        "- For PROJECT SUBMISSION: Explain the git workflow, PR process, and deployment schedule.\n"
        "- For GENERAL KNOWLEDGE: Answer like a helpful, intelligent assistant. Use your full capabilities.\n"
        "- Do NOT use emojis. Keep the tone professional and clear.\n"
        "- Use markdown formatting (bold, bullet points, code blocks) for readability.\n"
        "- If a question involves company-specific info not in the knowledge base, say so and suggest who to ask."
    )
    
    response = llm.invoke([
        SystemMessage(content=prompt),
        HumanMessage(content=query)
    ])
    return {
        "messages": state["messages"] + [{"sender": "general_assistant", "content": response.content}],
        "next_node": "compliance_auditor"
    }

# ============================================================
# GUARDRAIL BLOCKED NODE
# ============================================================

def guardrail_blocked_node(state: OnboardState) -> Dict[str, Any]:
    blocked_response = (
        "I appreciate you reaching out, but that question falls outside my scope as a workplace assistant. "
        "I'm here to help with onboarding, company policies, IT setup, team information, code reviews, "
        "project submissions, and other work-related topics.\n\n"
        "Here are some things I can help you with:\n"
        "- Company policies and benefits\n"
        "- Leave requests and HR processes\n"
        "- IT account setup and hardware orders\n"
        "- Team contacts and office directions\n"
        "- Code help and project submission workflows\n"
        "- Meeting setup and communication tools\n\n"
        "Feel free to ask about any of these topics."
    )
    return {
        "messages": state["messages"] + [{"sender": "guardrail", "content": blocked_response}],
        "next_node": "compliance_auditor"
    }

# ============================================================
# COMPLIANCE AUDITOR
# ============================================================

def compliance_auditor(state: OnboardState) -> Dict[str, Any]:
    return {"compliance_passed": True, "next_node": END}

# ============================================================
# GRAPH ASSEMBLY
# ============================================================

workflow = StateGraph(OnboardState)
workflow.add_node("supervisor", supervisor_router)
workflow.add_node("knowledge_rag", knowledge_rag_node)
workflow.add_node("it_provisioner", it_provisioner_node)
workflow.add_node("general_assistant", general_assistant_node)
workflow.add_node("guardrail_blocked", guardrail_blocked_node)
workflow.add_node("compliance_auditor", compliance_auditor)

workflow.set_entry_point("supervisor")
workflow.add_conditional_edges("supervisor", lambda state: state["next_node"], {
    "knowledge_rag": "knowledge_rag",
    "it_provisioner": "it_provisioner",
    "general_assistant": "general_assistant",
    "guardrail_blocked": "guardrail_blocked"
})
workflow.add_edge("knowledge_rag", "compliance_auditor")
workflow.add_edge("it_provisioner", "compliance_auditor")
workflow.add_edge("general_assistant", "compliance_auditor")
workflow.add_edge("guardrail_blocked", "compliance_auditor")
workflow.add_edge("compliance_auditor", END)

agent_graph = workflow.compile()
