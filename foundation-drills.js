/* Beginner reinforcement drills — original questions. Some positions are from the learner's uploaded PGN, anonymized. */
window.FOUNDATION_DRILLS=[
  {
    "id": "F01",
    "lesson": 1,
    "kind": "mc",
    "prompt": "Game 1: White to move. What makes 17.Qg4+ a blunder?",
    "fen": "1rbq1rk1/2p2p2/p4b1p/8/P2Q4/1P3N2/2P2PPP/R1B2RK1 w - - 0 17",
    "options": [
      "The bishop on c8 can capture the queen on g4.",
      "Black's knight can capture the queen on g4.",
      "The move leaves White's king in check.",
      "The pawn on h6 can capture the queen on g4."
    ],
    "answer": 0,
    "explanation": "The c8 bishop travels along d7–e6–f5 to g4, so 17...Bxg4 wins the queen. Checks are not automatically safe.",
    "hint": "Trace every opposing bishop diagonal before placing the queen.",
    "priority": 1,
    "skill": "Queen safety",
    "foundation": true
  },
  {
    "id": "F02",
    "lesson": 1,
    "kind": "mc",
    "prompt": "Game 1: Which question is most useful before giving a queen check?",
    "fen": "1rbq1rk1/2p2p2/p4b1p/8/P2Q4/1P3N2/2P2PPP/R1B2RK1 w - - 0 17",
    "options": [
      "Can an opposing piece capture my queen on its destination?",
      "Does the move use the queen before move 20?",
      "Will this move automatically force checkmate?",
      "Is the opponent's last move a pawn move?"
    ],
    "answer": 0,
    "explanation": "Before committing to a check, calculate the opponent's legal responses, especially captures of the checking piece.",
    "hint": "Checking moves still need a blunder scan.",
    "priority": 1,
    "skill": "Blunder prevention",
    "foundation": true
  },
  {
    "id": "F03",
    "lesson": 1,
    "kind": "mc",
    "prompt": "Game 5: White is thinking of 21.Qxd6+. What is the immediate danger?",
    "fen": "8/8/p1kp1np1/1p1p3p/5Q2/2N5/PPb2PPP/5RK1 w - - 0 21",
    "options": [
      "The black king on c6 can capture the queen on d6.",
      "A rook on h8 pins the white queen.",
      "White is forced to castle first.",
      "Black can promote the pawn on a6 immediately."
    ],
    "answer": 0,
    "explanation": "After 21.Qxd6+, the black king on c6 can take the queen with 21...Kxd6. Check the king's capture squares, not just other pieces.",
    "hint": "A king can capture an undefended enemy piece if its destination is safe.",
    "priority": 1,
    "skill": "Queen safety",
    "foundation": true
  },
  {
    "id": "F04",
    "lesson": 5,
    "kind": "mc",
    "prompt": "Game 5: What is the immediate threat from Black's pawn on d2?",
    "fen": "8/8/p2k1np1/1p5p/8/2N5/PPbp1PPP/4R1K1 w - - 0 25",
    "options": [
      "It can advance to d1 and promote.",
      "It can capture the rook on e1.",
      "It can move backward to d3.",
      "It is pinned by the white king."
    ],
    "answer": 0,
    "explanation": "A black pawn on d2 is one step from promotion on d1. The pawn is not harmless because it has almost reached the back rank.",
    "hint": "Check which pawn is closest to the promotion rank.",
    "priority": 1,
    "skill": "Passed pawns",
    "foundation": true
  },
  {
    "id": "F05",
    "lesson": 5,
    "kind": "mc",
    "prompt": "Game 5: What should White prioritize when the opposing pawn reaches d2?",
    "fen": "8/8/p2k1np1/1p5p/8/2N5/PPbp1PPP/4R1K1 w - - 0 25",
    "options": [
      "Find a legal way to stop or capture the pawn before promotion.",
      "Ignore the pawn to play on the opposite wing.",
      "Trade queens, even though neither queen is on the board.",
      "Assume a rook always stops a pawn by standing nearby."
    ],
    "answer": 0,
    "explanation": "Passed pawns one square from promotion demand concrete calculation. Consider checks, captures, and ways to control d1.",
    "hint": "A pawn one move from promoting creates a forcing threat.",
    "priority": 5,
    "skill": "Passed pawns",
    "foundation": true
  },
  {
    "id": "F06",
    "lesson": 2,
    "kind": "mc",
    "prompt": "Game 2: Why is White's king on e2 a potential problem?",
    "fen": "rn1qkb1r/ppp2ppp/3p1n2/4p3/4P1bP/3P1N2/PPP1KPP1/RNBQ1B1R b kq - 2 5",
    "options": [
      "It has lost the right to castle and can become a target.",
      "A king can never move before all minor pieces develop.",
      "The king on e2 automatically wins material.",
      "The king is already checkmated."
    ],
    "answer": 0,
    "explanation": "Moving the king from e1 permanently loses castling rights; an exposed king may give the opponent attacking tempi.",
    "hint": "Look at how early king moves affect castling.",
    "priority": 2,
    "skill": "King safety",
    "foundation": true
  },
  {
    "id": "F07",
    "lesson": 2,
    "kind": "mc",
    "prompt": "Game 2: What is a sensible general plan when the opponent's king stays in the center?",
    "fen": "rn1qkb1r/ppp2ppp/3p1n2/4p3/4P1bP/3P1N2/PPP1KPP1/RNBQ1B1R b kq - 2 5",
    "options": [
      "Develop actively and consider opening central lines when tactically safe.",
      "Retreat every developed piece to its starting square.",
      "Push only edge pawns regardless of threats.",
      "Assume an exposed king is already checkmated."
    ],
    "answer": 0,
    "explanation": "Centralized pieces and open files can increase pressure on an uncastled king, but you still need to calculate tactics.",
    "hint": "Think about open lines toward the king.",
    "priority": 2,
    "skill": "King safety",
    "foundation": true
  },
  {
    "id": "F08",
    "lesson": 1,
    "kind": "mc",
    "prompt": "Game 3: After Black plays 2...f6, which principle should Black consider?",
    "fen": "rnbqkbnr/ppp1p1pp/5p2/3pN3/8/8/PPPPPPPP/RNBQKB1R w KQkq - 0 3",
    "options": [
      "Early pawn moves can leave weakened squares near the king.",
      "Every early f-pawn move is an illegal move.",
      "The f-pawn permanently prevents Black from castling.",
      "Black must capture the knight with the queen immediately."
    ],
    "answer": 0,
    "explanation": "The move ...f6 attacks the knight but also creates weaknesses near Black's king. Evaluate both the gain of tempo and the king-safety cost.",
    "hint": "A move can have both a threat and a positional cost.",
    "priority": 2,
    "skill": "King safety",
    "foundation": true
  },
  {
    "id": "F09",
    "lesson": 1,
    "kind": "mc",
    "prompt": "Before moving a valuable piece onto a square, what should you check first?",
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "options": [
      "Whether the destination is attacked and whether captures are safe.",
      "Whether the destination is the same color as your king.",
      "Whether the piece has moved in a previous game.",
      "Whether the move number ends in an even digit."
    ],
    "answer": 0,
    "explanation": "Counting attackers and defenders, and checking forcing replies, prevents many one-move blunders.",
    "hint": "Consider what the opponent can do immediately after your move.",
    "priority": 1,
    "skill": "Blunder prevention",
    "foundation": true
  },
  {
    "id": "F10",
    "lesson": 2,
    "kind": "mc",
    "prompt": "When an opponent gives check, which response must you consider?",
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "options": [
      "Move the king, block the check, or capture the checking piece if legal.",
      "Always move your queen to the center.",
      "Ignore the check if you threaten a rook.",
      "Every check can be blocked by a pawn."
    ],
    "answer": 0,
    "explanation": "The legal ways out of check are moving the king, blocking a blockable attack, or capturing the checking piece. Which choices work depends on the position.",
    "hint": "Think of the three general types of check responses.",
    "priority": 2,
    "skill": "King safety",
    "foundation": true
  },
  {
    "id": "F11",
    "lesson": 5,
    "kind": "mc",
    "prompt": "In an endgame, what makes an enemy passed pawn particularly urgent?",
    "fen": "8/8/8/8/8/8/3p4/4K2k w - - 0 1",
    "options": [
      "It is close to promoting and lacks an opposing pawn directly blocking its file.",
      "Every passed pawn must be captured with a queen.",
      "It can immediately move backward.",
      "It prevents the opposing king from making any legal move."
    ],
    "answer": 0,
    "explanation": "A passed pawn has no opposing pawns ahead of it on its file or adjacent files. A pawn on the seventh rank may be one step from promotion.",
    "hint": "Count how many pawn moves remain before promotion.",
    "priority": 5,
    "skill": "Passed pawns",
    "foundation": true
  },
  {
    "id": "F12",
    "lesson": 1,
    "kind": "mc",
    "prompt": "After finding a promising check or capture, what is the best next calculation step?",
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "options": [
      "Look for the opponent's strongest legal reply, especially recaptures.",
      "Assume the opponent must follow your intended plan.",
      "Stop calculating because checks always win.",
      "Always trade a rook for a pawn."
    ],
    "answer": 0,
    "explanation": "A forcing move may lose material if your opponent can capture the attacking piece. Look one move further before playing it.",
    "hint": "The opponent does not have to respond as you hope.",
    "priority": 1,
    "skill": "Blunder prevention",
    "foundation": true
  }
];
