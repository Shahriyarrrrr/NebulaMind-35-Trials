from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import uuid

app = FastAPI(title="NebulaMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartPayload(BaseModel):
    name: str
    tag: str
    age: int
    avatar: str
    domain: str = "mixed"

class AnswerPayload(BaseModel):
    session_id: str
    qid: str
    answer_index: int

SESSIONS: Dict[str, Dict] = {}

# 35 questions (text, options, correct_index, level)
QUESTIONS = [
    ("What is 2 + 2?", ["3","4","5","22"], 1, 1),
    ("The capital of France is:", ["Berlin","Madrid","Paris","Rome"], 2, 2),
    ("Which planet is known as the Red Planet?", ["Mars","Venus","Jupiter","Mercury"], 0, 3),
    ("Binary of decimal 5 is:", ["101","110","111","100"], 0, 4),
    ("H2O is the chemical formula for:", ["Oxygen","Hydrogen","Water","Salt"], 2, 5),
    ("Who wrote '1984'?", ["George Orwell","Aldous Huxley","J.K. Rowling","Mark Twain"], 0, 6),
    ("Prime number among these:", ["21","39","41","51"], 2, 7),
    ("Solve: 9 × 7 =", ["56","63","72","81"], 1, 8),
    ("HTTP stands for:", ["HyperText Transfer Protocol","HighText Transfer Protocol","Hyperlink Transfer Program","Home Transfer Protocol"], 0, 9),
    ("Largest ocean:", ["Indian","Arctic","Pacific","Atlantic"], 2, 10),
    ("Speed of light is approx:", ["3×10^8 m/s","3×10^6 m/s","3×10^5 m/s","3×10^7 m/s"], 0, 11),
    ("Who painted the Mona Lisa?", ["Van Gogh","Picasso","Da Vinci","Rembrandt"], 2, 12),
    ("Which gas is most abundant in Earth's atmosphere?", ["O2","N2","CO2","Ar"], 1, 13),
    ("Result of 12^2:", ["124","122","144","112"], 2, 14),
    ("Which data structure uses FIFO?", ["Stack","Queue","Tree","Graph"], 1, 15),
    ("Pythagoras theorem relates to:", ["Circles","Right triangles","Polygons","Ellipses"], 1, 16),
    ("Which is not a programming language?", ["Python","Ruby","HTML","Go"], 2, 17),
    ("The human adult has how many bones?", ["206","201","210","190"], 0, 18),
    ("Derivative of x^2 is:", ["x","2x","x^3","2"], 1, 19),
    ("Year man first landed on the Moon:", ["1965","1969","1972","1959"], 1, 20),
    ("Which is a mammal?", ["Shark","Dolphin","Octopus","Penguin"], 1, 21),
    ("Which is a primary key property?", ["Nullable","Unique","Duplicate","Variable"], 1, 22),
    ("RSA is used for:", ["Sorting","Encryption","Hashing","Compression"], 1, 23),
    ("E = mc^2 relates mass and:", ["Force","Energy","Time","Voltage"], 1, 24),
    ("Which is not an SQL join?", ["LEFT","RIGHT","MIDDLE","INNER"], 2, 25),
    ("Which number is Fibonacci?", ["20","21","22","24"], 1, 26),
    ("Heaviest naturally occurring element by stable atomic weight:", ["Uranium","Lead","Gold","Mercury"], 0, 27),
    ("Time complexity of binary search:", ["O(n)","O(log n)","O(n log n)","O(1)"], 1, 28),
    ("Which protocol secures HTTP?", ["SSH","SFTP","TLS","IMAP"], 2, 29),
    ("Who developed the theory of relativity?", ["Newton","Einstein","Bohr","Maxwell"], 1, 30),
    ("Solve: 17×19?", ["323","331","349","357"], 2, 31),
    ("Which is a stable sorting algorithm?", ["QuickSort","MergeSort","HeapSort","SelectionSort"], 1, 32),
    ("The SI unit of force:", ["Joule","Pascal","Newton","Watt"], 2, 33),
    ("Which DB is document-oriented?", ["MySQL","MongoDB","PostgreSQL","SQLite"], 1, 34),
    ("Which of these is not a prime?", ["97","91","89","83"], 1, 35),
]

LEVEL_MAP = { lvl: None for lvl in range(1,36) }
for q in QUESTIONS:
    if q[3] in LEVEL_MAP and LEVEL_MAP[q[3]] is None:
        LEVEL_MAP[q[3]] = q

def build_question_payload(level:int):
    q = LEVEL_MAP.get(level)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found for this level")
    text, options, correct_index, lvl = q
    return {
        "qid": f"q{lvl}",
        "text": text,
        "options": options,
        "correctIndex": correct_index,
        "level": lvl,
    }

@app.post("/start")
def start(payload: StartPayload):
    if payload.age < 18:
        raise HTTPException(status_code=403, detail="Must be 18+ to play")
    sid = uuid.uuid4().hex
    SESSIONS[sid] = {
        "player": payload.model_dump(),
        "level": 1,
        "score": 0,
        "used": {"fifty":False, "best2":False, "audience":False},
        "history": [],
    }
    return {"session_id": sid}

@app.get("/question")
def question(session_id: str, level: int):
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Invalid session")
    if level < 1 or level > 35:
        raise HTTPException(status_code=400, detail="Invalid level")
    return build_question_payload(level)

@app.post("/answer")
def answer(payload: AnswerPayload):
    sess = SESSIONS.get(payload.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Invalid session")
    lvl = int(payload.qid.replace('q',''))
    q = LEVEL_MAP.get(lvl)
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    _, _, correct_index, _ = q
    correct = (payload.answer_index == correct_index)
    if correct:
        sess["level"] = lvl + 1
        sess["score"] += 1
        finished = (lvl >= 35)
        return {"correct": True, "level": lvl, "finished": finished}
    else:
        return {"correct": False, "level": lvl}
