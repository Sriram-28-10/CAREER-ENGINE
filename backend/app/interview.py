"""
interview.py
Interview preparation module: curated Q&A database and answer scoring logic.
"""

from typing import Dict, List, Any, Optional

# ─────────────────────────────────────────────────────────────────
# Interview Question Database
# ─────────────────────────────────────────────────────────────────

INTERVIEW_QUESTIONS: Dict[str, Dict[str, List[Dict[str, Any]]]] = {
    "data_analyst_intern": {
        "technical": [
            {"id": 1, "question": "Explain the difference between INNER JOIN and LEFT JOIN in SQL. When would you use each?",
             "ideal_keywords": ["inner join", "matching rows", "left join", "all rows", "null", "outer"], "difficulty": "medium"},
            {"id": 2, "question": "What is the purpose of GROUP BY and HAVING clauses? Give an example.",
             "ideal_keywords": ["aggregate", "group", "having", "filter", "count", "sum", "after grouping"], "difficulty": "medium"},
            {"id": 3, "question": "How would you handle missing data (NaN values) in a Pandas DataFrame?",
             "ideal_keywords": ["dropna", "fillna", "interpolate", "impute", "mean", "median", "strategy"], "difficulty": "easy"},
            {"id": 4, "question": "What is EDA (Exploratory Data Analysis)? What steps do you follow?",
             "ideal_keywords": ["distribution", "correlation", "histogram", "boxplot", "outlier", "describe", "visualization"], "difficulty": "easy"},
            {"id": 5, "question": "Explain the difference between a dimension and a fact table in a data warehouse.",
             "ideal_keywords": ["dimension", "fact", "measures", "star schema", "foreign key", "attributes"], "difficulty": "hard"},
        ],
        "behavioral": [
            {"id": 6, "question": "Tell me about a time you had to work with a large or messy dataset. How did you handle it?",
             "ideal_keywords": ["cleaned", "pipeline", "challenge", "approach", "result", "learned"], "difficulty": "medium"},
            {"id": 7, "question": "Describe a situation where your data analysis led to a significant business decision.",
             "ideal_keywords": ["insight", "recommendation", "impact", "stakeholder", "decision", "result"], "difficulty": "medium"},
            {"id": 8, "question": "How do you explain complex data findings to non-technical stakeholders?",
             "ideal_keywords": ["visualization", "simple", "story", "context", "avoid jargon", "dashboard"], "difficulty": "easy"},
        ],
        "hr": [
            {"id": 9, "question": "Why do you want to pursue a career in data analytics?",
             "ideal_keywords": ["data driven", "patterns", "insights", "problem solving", "impact", "passion"], "difficulty": "easy"},
            {"id": 10, "question": "Where do you see yourself in 3-5 years in this field?",
             "ideal_keywords": ["grow", "senior", "leadership", "specialize", "skills", "contribute"], "difficulty": "easy"},
        ]
    },
    "web_developer": {
        "technical": [
            {"id": 1, "question": "Explain the difference between CSS Flexbox and Grid. When should you use each?",
             "ideal_keywords": ["flexbox", "one-dimensional", "grid", "two-dimensional", "row", "column", "layout"], "difficulty": "medium"},
            {"id": 2, "question": "What is the difference between == and === in JavaScript?",
             "ideal_keywords": ["strict equality", "type coercion", "triple equals", "value", "type", "loose"], "difficulty": "easy"},
            {"id": 3, "question": "Explain the concept of closures in JavaScript with an example.",
             "ideal_keywords": ["closure", "scope", "inner function", "outer", "access", "lexical"], "difficulty": "hard"},
            {"id": 4, "question": "What is the DOM? How does JavaScript interact with it?",
             "ideal_keywords": ["document object model", "tree", "element", "queryselector", "event", "manipulate"], "difficulty": "easy"},
            {"id": 5, "question": "Explain what a REST API is and the HTTP methods used.",
             "ideal_keywords": ["rest", "get", "post", "put", "delete", "stateless", "resource", "endpoint"], "difficulty": "medium"},
        ],
        "behavioral": [
            {"id": 6, "question": "Describe a project where you improved website performance. What techniques did you use?",
             "ideal_keywords": ["lazy loading", "caching", "minify", "compress", "lighthouse", "optimize"], "difficulty": "medium"},
            {"id": 7, "question": "Tell me about a time you debugged a difficult frontend issue.",
             "ideal_keywords": ["devtools", "console", "breakpoint", "systematic", "isolate", "fix"], "difficulty": "medium"},
            {"id": 8, "question": "How do you ensure your websites are accessible to all users?",
             "ideal_keywords": ["aria", "semantic", "alt text", "keyboard", "wcag", "screen reader", "contrast"], "difficulty": "medium"},
        ],
        "hr": [
            {"id": 9, "question": "What aspects of web development excite you the most?",
             "ideal_keywords": ["user experience", "creative", "problem solving", "technology", "visual", "impact"], "difficulty": "easy"},
            {"id": 10, "question": "How do you stay up to date with the fast-paced changes in web technologies?",
             "ideal_keywords": ["blogs", "mdn", "github", "courses", "community", "practice", "projects"], "difficulty": "easy"},
        ]
    },
    "full_stack_developer": {
        "technical": [
            {"id": 1, "question": "What is the difference between SQL and NoSQL databases? Give examples of when to use each.",
             "ideal_keywords": ["relational", "structured", "nosql", "document", "flexible", "scale", "mongodb", "postgres"], "difficulty": "medium"},
            {"id": 2, "question": "Explain the concept of middleware in Express.js or FastAPI.",
             "ideal_keywords": ["middleware", "request", "response", "pipeline", "intercept", "authentication", "logging"], "difficulty": "medium"},
            {"id": 3, "question": "How does React's virtual DOM work and why is it efficient?",
             "ideal_keywords": ["virtual dom", "diffing", "reconciliation", "minimal updates", "real dom", "performance"], "difficulty": "hard"},
            {"id": 4, "question": "What is containerization with Docker and why is it useful?",
             "ideal_keywords": ["container", "image", "isolation", "environment", "consistent", "deploy", "dockerfile"], "difficulty": "medium"},
            {"id": 5, "question": "Explain the concept of CORS and how you handle it in an API.",
             "ideal_keywords": ["cross-origin", "headers", "allow-origin", "preflight", "options", "security", "browser"], "difficulty": "hard"},
        ],
        "behavioral": [
            {"id": 6, "question": "Describe a full-stack project you built from scratch. Walk me through your architecture decisions.",
             "ideal_keywords": ["frontend", "backend", "database", "api", "decision", "trade-off", "architecture"], "difficulty": "hard"},
            {"id": 7, "question": "How do you handle disagreements with team members about technical approaches?",
             "ideal_keywords": ["communication", "discuss", "pros cons", "compromise", "team", "respect", "outcome"], "difficulty": "medium"},
        ],
        "hr": [
            {"id": 9, "question": "What motivates you to work as a full-stack developer?",
             "ideal_keywords": ["end to end", "ownership", "versatile", "problem", "both sides", "impact"], "difficulty": "easy"},
            {"id": 10, "question": "Tell me about your biggest technical challenge and how you overcame it.",
             "ideal_keywords": ["challenge", "research", "persevere", "learn", "solution", "outcome", "growth"], "difficulty": "medium"},
        ]
    },
    "data_scientist": {
        "technical": [
            {"id": 1, "question": "Explain the bias-variance tradeoff in machine learning.",
             "ideal_keywords": ["bias", "variance", "underfitting", "overfitting", "complexity", "regularization", "tradeoff"], "difficulty": "hard"},
            {"id": 2, "question": "What is cross-validation? Why is it important?",
             "ideal_keywords": ["k-fold", "train", "validation", "generalization", "overfitting", "evaluation", "split"], "difficulty": "medium"},
            {"id": 3, "question": "Explain Precision vs Recall. When would you optimize for each?",
             "ideal_keywords": ["precision", "recall", "false positive", "false negative", "f1", "threshold", "use case"], "difficulty": "hard"},
            {"id": 4, "question": "What is gradient descent and how does it work?",
             "ideal_keywords": ["gradient", "learning rate", "minimize", "loss", "partial derivative", "update", "converge"], "difficulty": "hard"},
            {"id": 5, "question": "Explain what regularization is and name two common types.",
             "ideal_keywords": ["l1", "l2", "lasso", "ridge", "penalty", "overfitting", "weights"], "difficulty": "hard"},
        ],
        "behavioral": [
            {"id": 6, "question": "Tell me about an ML model you built. What problem did it solve?",
             "ideal_keywords": ["problem", "data", "model", "train", "evaluate", "deploy", "result", "impact"], "difficulty": "hard"},
            {"id": 7, "question": "How do you handle imbalanced datasets?",
             "ideal_keywords": ["smote", "oversample", "undersample", "class weight", "precision recall", "imbalanced"], "difficulty": "medium"},
        ],
        "hr": [
            {"id": 9, "question": "Why are you interested in data science?",
             "ideal_keywords": ["data", "patterns", "insights", "ml", "ai", "impact", "problem solving"], "difficulty": "easy"},
            {"id": 10, "question": "What is a recent paper or technique in ML that excites you?",
             "ideal_keywords": ["transformer", "llm", "diffusion", "rl", "research", "technique", "paper"], "difficulty": "medium"},
        ]
    },
    "data_engineer": {
        "technical": [
            {"id": 1, "question": "What is the difference between ETL and ELT? When would you use each?",
             "ideal_keywords": ["extract", "transform", "load", "etl", "elt", "cloud", "data warehouse", "sequence"], "difficulty": "medium"},
            {"id": 2, "question": "Explain Apache Kafka's architecture and use cases.",
             "ideal_keywords": ["topic", "producer", "consumer", "broker", "partition", "streaming", "real-time"], "difficulty": "hard"},
            {"id": 3, "question": "What is Apache Airflow and how does it help in data engineering?",
             "ideal_keywords": ["dag", "task", "schedule", "orchestration", "pipeline", "dependency", "workflow"], "difficulty": "hard"},
            {"id": 4, "question": "Explain star schema vs snowflake schema in data warehouses.",
             "ideal_keywords": ["star", "snowflake", "fact", "dimension", "normalized", "denormalized", "query"], "difficulty": "hard"},
            {"id": 5, "question": "How would you optimize a slow SQL query?",
             "ideal_keywords": ["index", "explain plan", "join order", "partition", "cache", "statistics", "optimize"], "difficulty": "medium"},
        ],
        "behavioral": [
            {"id": 6, "question": "Describe a data pipeline you built. What were the main challenges?",
             "ideal_keywords": ["pipeline", "source", "transform", "destination", "challenge", "reliability", "scale"], "difficulty": "hard"},
            {"id": 7, "question": "How do you ensure data quality in your pipelines?",
             "ideal_keywords": ["validation", "test", "monitor", "alert", "null", "duplicates", "schema"], "difficulty": "medium"},
        ],
        "hr": [
            {"id": 9, "question": "What aspect of data engineering interests you most?",
             "ideal_keywords": ["scale", "pipeline", "infrastructure", "reliability", "architecture", "real-time"], "difficulty": "easy"},
            {"id": 10, "question": "How do you approach learning a new data technology or tool?",
             "ideal_keywords": ["documentation", "hands-on", "project", "community", "course", "experiment"], "difficulty": "easy"},
        ]
    },
    "aiml_intern": {
        "technical": [
            {"id": 1, "question": "Explain the difference between supervised, unsupervised, and reinforcement learning.",
             "ideal_keywords": ["labeled", "unlabeled", "reward", "classification", "clustering", "agent", "policy"], "difficulty": "medium"},
            {"id": 2, "question": "What are neural networks and how do they learn?",
             "ideal_keywords": ["neuron", "layer", "activation", "backpropagation", "weights", "gradient", "loss"], "difficulty": "hard"},
            {"id": 3, "question": "What is the purpose of train/validation/test splits?",
             "ideal_keywords": ["train", "validation", "test", "hyperparameter", "generalization", "overfitting", "evaluation"], "difficulty": "easy"},
            {"id": 4, "question": "Explain what a transformer model is and how attention works.",
             "ideal_keywords": ["attention", "encoder", "decoder", "query", "key", "value", "self-attention", "llm"], "difficulty": "hard"},
            {"id": 5, "question": "What is transfer learning and why is it useful?",
             "ideal_keywords": ["pretrained", "fine-tune", "features", "transfer", "dataset", "domain", "efficiency"], "difficulty": "medium"},
        ],
        "behavioral": [
            {"id": 6, "question": "Tell me about an ML project you worked on. What did you learn?",
             "ideal_keywords": ["dataset", "model", "train", "evaluate", "improve", "result", "learn", "challenge"], "difficulty": "medium"},
            {"id": 7, "question": "How do you debug a model that is not performing well?",
             "ideal_keywords": ["data", "architecture", "hyperparameter", "learning rate", "overfitting", "metric", "analysis"], "difficulty": "hard"},
        ],
        "hr": [
            {"id": 9, "question": "What excites you most about working in AI/ML?",
             "ideal_keywords": ["ai", "impact", "innovation", "solve", "intelligent", "future", "technology"], "difficulty": "easy"},
            {"id": 10, "question": "How do you keep up with the rapid advances in AI/ML?",
             "ideal_keywords": ["arxiv", "papers", "kaggle", "hugging face", "courses", "community", "projects"], "difficulty": "easy"},
        ]
    },
    "frontend_dev_intern": {
        "technical": [
            {"id": 1, "question": "Explain React hooks — what are useState and useEffect used for?",
             "ideal_keywords": ["state", "side effect", "lifecycle", "rerender", "dependency", "cleanup", "functional"], "difficulty": "medium"},
            {"id": 2, "question": "What is TypeScript and why would you use it over plain JavaScript?",
             "ideal_keywords": ["types", "static", "compile", "error", "interface", "better tooling", "safety"], "difficulty": "easy"},
            {"id": 3, "question": "Explain the concept of component props and state in React.",
             "ideal_keywords": ["props", "state", "parent", "child", "pass", "manage", "re-render"], "difficulty": "easy"},
            {"id": 4, "question": "What is CSS-in-JS and how does Tailwind CSS differ from it?",
             "ideal_keywords": ["utility", "tailwind", "class", "css-in-js", "styled", "scoped", "atomic"], "difficulty": "medium"},
            {"id": 5, "question": "How does the Next.js App Router work? What is Server vs Client components?",
             "ideal_keywords": ["app router", "server component", "client component", "use client", "streaming", "page"], "difficulty": "hard"},
        ],
        "behavioral": [
            {"id": 6, "question": "Describe a UI/UX challenge you faced in a project and how you solved it.",
             "ideal_keywords": ["design", "user", "feedback", "iterate", "accessibility", "responsive", "solution"], "difficulty": "medium"},
            {"id": 7, "question": "How do you optimize a React application for performance?",
             "ideal_keywords": ["memo", "usecallback", "lazy", "code split", "virtualize", "bundle", "profiler"], "difficulty": "hard"},
        ],
        "hr": [
            {"id": 9, "question": "What is your favourite thing about building user interfaces?",
             "ideal_keywords": ["user", "visual", "creative", "responsive", "interaction", "feedback", "experience"], "difficulty": "easy"},
            {"id": 10, "question": "How do you handle design specifications from a designer?",
             "ideal_keywords": ["figma", "pixel perfect", "collaborate", "clarify", "implement", "feedback", "iterate"], "difficulty": "easy"},
        ]
    }
}

FALLBACK_QUESTIONS = {
    "technical": [
        {"id": 1, "question": "What is version control and why is Git important?",
         "ideal_keywords": ["track", "history", "collaborate", "branch", "merge", "commit", "repository"], "difficulty": "easy"},
        {"id": 2, "question": "Explain what an API is and how it's used.",
         "ideal_keywords": ["application programming interface", "endpoint", "request", "response", "integration", "communicate"], "difficulty": "easy"},
        {"id": 3, "question": "What is the difference between frontend and backend development?",
         "ideal_keywords": ["frontend", "ui", "browser", "backend", "server", "database", "client", "server-side"], "difficulty": "easy"},
    ],
    "behavioral": [
        {"id": 6, "question": "Tell me about a challenging project you worked on and how you overcame obstacles.",
         "ideal_keywords": ["challenge", "problem", "solution", "team", "result", "learned", "overcome"], "difficulty": "medium"},
        {"id": 7, "question": "How do you manage your time when working on multiple tasks?",
         "ideal_keywords": ["prioritize", "deadline", "plan", "organized", "schedule", "communicate"], "difficulty": "easy"},
    ],
    "hr": [
        {"id": 9, "question": "Why are you interested in this field?",
         "ideal_keywords": ["passion", "interest", "impact", "grow", "learn", "contribute"], "difficulty": "easy"},
        {"id": 10, "question": "What are your strongest technical skills?",
         "ideal_keywords": ["skill", "proficient", "experience", "project", "tool", "language"], "difficulty": "easy"},
    ]
}


def get_questions(role_id: str, question_type: str = "technical") -> List[Dict[str, Any]]:
    """Return interview questions for a given role and type."""
    role_data = INTERVIEW_QUESTIONS.get(role_id, {})
    questions = role_data.get(question_type, FALLBACK_QUESTIONS.get(question_type, []))
    # Add type metadata
    return [{"type": question_type, **q} for q in questions]


def get_all_questions(role_id: str) -> List[Dict[str, Any]]:
    """Return all questions for a role (all types)."""
    all_q = []
    for qtype in ["technical", "behavioral", "hr"]:
        all_q.extend(get_questions(role_id, qtype))
    return all_q


def keyword_score_answer(answer: str, ideal_keywords: List[str]) -> Dict[str, Any]:
    """
    Fallback keyword-based scoring when Ollama is unavailable.
    Returns score (0-10) based on keyword coverage.
    """
    if not answer.strip():
        return {
            "score": 0,
            "feedback": "No answer was provided. Please attempt to answer the question.",
            "strengths": "N/A",
            "improvements": "Please provide a detailed answer.",
            "method": "keyword"
        }

    answer_lower = answer.lower()
    matched = [kw for kw in ideal_keywords if kw.lower() in answer_lower]
    coverage = len(matched) / max(len(ideal_keywords), 1)

    word_count = len(answer.split())
    length_bonus = min(0.2, word_count / 200)

    raw_score = coverage * 8.0 + length_bonus * 2.0
    score = min(10, max(1, round(raw_score)))

    if score >= 8:
        feedback = "Excellent answer! You covered the key concepts comprehensively."
        strengths = f"Great coverage of: {', '.join(matched[:3])}"
        improvements = "Consider adding real-world examples to strengthen your answer."
    elif score >= 6:
        feedback = "Good answer with solid understanding. A few key concepts could be elaborated."
        missing = [kw for kw in ideal_keywords if kw.lower() not in answer_lower][:2]
        strengths = f"You addressed: {', '.join(matched[:2])}"
        improvements = f"Consider mentioning: {', '.join(missing)}" if missing else "Add more depth and examples."
    elif score >= 4:
        feedback = "Partial answer. You touched on some concepts but missed important aspects."
        missing = [kw for kw in ideal_keywords if kw.lower() not in answer_lower][:3]
        strengths = f"Good start with: {', '.join(matched[:2]) if matched else 'basic understanding'}"
        improvements = f"Key missing concepts: {', '.join(missing)}"
    else:
        feedback = "The answer needs significant improvement. Review the core concepts for this topic."
        strengths = "You made an attempt to answer."
        improvements = f"Focus on understanding: {', '.join(ideal_keywords[:4])}"

    return {
        "score": score,
        "feedback": feedback,
        "strengths": strengths,
        "improvements": improvements,
        "method": "keyword",
        "keywords_matched": matched,
        "keywords_expected": ideal_keywords
    }
