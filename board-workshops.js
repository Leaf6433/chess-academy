// Authored teaching sequences. The Italian example is illustrative; the Opera Game is historical.
window.BOARD_WORKSHOPS = {
 italian: {
  title:'Your first Italian Game',lessons:[5,7,8,9,25,26],
  moves:'e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 g8f6 d2d3 d7d6 e1g1 e8g8 f1e1 a7a6 c4b3 c5a7 d3d4 e5d4 c3d4',
  stops:{
   0:['Move your king’s pawn two squares, from e2 to e4. Click the pawn, then its destination.','The pawn occupies the center and opens a path for your bishop. The notation e4 names its destination.'],
   2:['Develop the knight near your king. Which square lets it attack the pawn on e5?','Nf3 brings the knight into play and attacks e5. N means knight.'],
   4:['Bring the bishop from f1 to c4. Trace its diagonal toward the pawn beside Black’s king.','Bc4 gives this opening its Italian character. The bishop now looks toward f7.'],
   6:['Prepare a later push to d4 by moving the c-pawn one square.','From c3 the pawn can recapture on d4.'],
   8:['Black’s knight now attacks e4. Defend that pawn with your d-pawn.','On d3 the pawn keeps e4 protected while your king gets ready to castle.'],
   10:['Get the king to safety. Select e1 and then g1 to castle.','Castling moves both the king and rook. Once the rook reaches e1 it can support e4.'],
   12:['Put the rook on the same file as your e-pawn.','Re1 gives e4 another defender. Later the d-pawn can advance without leaving e4 loose.'],
   16:['Your king is safe and e4 has rook support. Which pawn push challenges e5?','The d4 break challenges Black’s center. If Black captures, your c3 pawn can take back.'],
   18:['Black captured your pawn. Which pawn can rebuild your center?','After cxd4, White has pawns on d4 and e4. That is what the earlier c3 and Re1 made possible.']
  },
  notes:{1:'Black also takes central space.',3:'Black develops a knight to defend e5.',5:'Black develops the bishop toward f2.',7:'The knight on f6 attacks e4.',9:'Black reinforces e5.',11:'Black castles too.',13:'Black gives the bishop a retreat square on a7.',14:'White withdraws the bishop, keeping it on the diagonal toward f7.',15:'Black moves the bishop away from a future d4 attack.',17:'Black exchanges on d4.'}
 },
 opera:{
  title:'Morphy’s Opera Game',lessons:[1,3,4,20,24,31,34],
  moves:'e2e4 e7e5 g1f3 d7d6 d2d4 c8g4 d4e5 g4f3 d1f3 d6e5 f1c4 g8f6 f3b3 d8e7 b1c3 c7c6 c1g5 b7b5 c3b5 c6b5 c4b5 b8d7 e1c1 a8d8 d1d7 d8d7 h1d1 e7e6 b5d7 f6d7 b3b8 d7b8 d1d8',
  stops:{
   10:['Black’s king is still in the center. Develop the bishop to attack f7.','Bc4 develops a piece with a threat. Black must reckon with both the bishop and queen attacking f7.'],
   22:['Your king and both rooks are still on their starting squares. Can you bring a rook to the d-file in one move?','Castling long puts the rook on d1 immediately. The d7 knight is pinned to its king by the bishop on b5.'],
   30:['Black’s knight on d7 can block your rook. Find a queen check that draws it away.','Qb8+ forces the knight to capture on b8. Now the d-file is clear.'],
   32:['Finish the game with the rook. Which square gives checkmate?','Rd8 is mate. The bishop on g5 protects the rook on d8. Black’s own pieces close the escape squares.']
  },
  notes:{0:'Paris, 1858. Play through Morphy’s game against the Duke of Brunswick and Count Isouard.',17:'Black attacks the bishop, but the black king is still on e8.',26:'The second rook takes over the open d-file.'}
 }
};

window.POSITION_PAIRS={
 fork:{title:'Can the knight fork survive?',lessons:[2,3,17,18,19,23],
  positions:['r3k2b/8/8/3N4/8/8/8/4K3 w - - 0 1','r2bk3/8/8/3N4/8/8/8/4K3 w - - 0 1'],
  move:'d5c7',reply:'d8c7',prompt:'Jump with the knight to check the king and attack the rook.',
  first:'Nc7+ attacks e8 and a8. The king must respond and the rook is left behind.',
  second:'The bishop moved from h8 to d8. Try the same fork, then take Black’s side.',
  response:'Capture the checking knight with the piece that now guards c7.',
  finish:'Bxc7 removes the check and saves the rook. Before playing a fork, check who guards the landing square.'},
 center:{title:'When can the d-pawn advance?',lessons:[5,7,8,14,26],
  positions:['r1bq1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP3PPP/RNBQR1K1 w - - 0 9','r1bq1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP3PPP/RNBQ1RK1 w - - 0 9'],
  move:'d3d4',reply:'f6e4',prompt:'Challenge the e5 pawn with your d-pawn. Check what protects e4.',
  first:'After d4 the rook on e1 still guards e4. A knight capture on e4 would let the rook take it.',
  second:'The rook is on f1 this time. Play d4 again and look at the square your pawn stopped guarding.',
  response:'Play Black’s knight capture on the newly undefended central pawn.',
  finish:'After …Nxe4 there is no rook on e1 to recapture. Before pushing a pawn, look at the square it stops defending.'}
};
