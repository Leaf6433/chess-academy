// Each change of plan begins immediately before the opponent's departure from the model.
window.OPENING_STUDIES = {
 italian: {
  notes:['From e4 the pawn controls d5 and f5. Moving it also clears e2, so the bishop on f1 can come out to c4.','The pawn on e5 controls d4. White can attack this pawn while developing a knight, so look for a move that does both.','The knight on f3 attacks e5. If Black ignores that threat, the knight can capture the pawn on its next turn.','The knight on c6 now guards e5. If White takes the pawn with Nxe5, Black can take that knight with …Nxe5.','Aim the bishop at f7 and clear the way to castle.','From c5 the bishop looks along d4 toward f2. If White later plants a pawn on d4, that pawn will also attack the bishop.','Prepare to support a future d4 push with a pawn.','Black attacks e4, making an immediate central push more complicated.','Support e4 and free the c1 bishop. You can castle before opening the center.'],
  title:'Two Knights Defense', fork:5, moves:['g8f6','d2d3','f8c5','e1g1'],
  branch:['Black develops with an attack on e4 before bringing out the bishop.','Choose the quiet response. Your d-pawn protects e4 and leaves the f3 knight free to move.','Black adds pressure on the diagonal toward f2.','Castle while the center is stable. You can prepare c3 and d4 later.']
 },
 scotch: {
  notes:['The e-pawn controls d5 and clears the path from f1 to b5. That diagonal matters when Black develops a knight to c6.','Black occupies e5.','Attack the e5 pawn while developing.','Black meets the threat with a developing move.','Challenge e5 immediately. An exchange will open lines for your pieces.','Black trades the e-pawn for your d-pawn.','Your knight recovers the pawn on d4 and attacks c6. Black can challenge it with a bishop on c5, so count its defenders before moving on.'],
  title:'The bishop attacks your knight',fork:7,moves:['f8c5','c1e3','d8f6','c2c3'],
  branch:['The bishop and c6 knight now both attack d4.','Develop a second defender of d4. If the bishop captures, yours can recapture.','The queen joins the attack on d4 and eyes f2.','Reinforce d4 with a pawn. Black can no longer trade off all its attackers there for a material gain.']
 },
 ruy: {
  notes:['Take central space and release the bishop.','Black stakes out e5.','Attack the central pawn.','Black develops a knight to protect e5.','Pressure the defender of e5. The c6 knight can still legally move.','The a6 pawn attacks your bishop on b5. Capturing the c6 knight trades away your bishop, while retreating to a4 keeps pressure on the knight.','Retain pressure on the knight from a4.','Black develops with an attack on e4.','Get the king safe. The e-pawn can be contested with active pieces.'],
  title:'Berlin Defense',fork:5,moves:['g8f6','e1g1','f6e4','d2d4'],
  branch:['Black counterattacks e4 without spending a tempo on a6.','Castle and make the e-file available for a rook.','Black accepts the pawn. Look for a way to open lines against the uncastled king.','Challenge e5 and open the c1 bishop. Development gives you compensation for the pawn.']
 },
 london: {
  notes:['Claim d4 and open the c1 bishop.','Black holds d5.','Develop and protect d4.','Black develops and controls e4.','The bishop passes through e3 on its way to f4. If you push the e-pawn first, your own pawn blocks that route.','Black reinforces d5 and opens the f8 bishop.','Anchor d4 and release your other bishop.'],
  title:'Black challenges d4 early',fork:5,moves:['c7c5','e2e3','b8c6','c2c3'],
  branch:['Black immediately attacks the base of your setup on d4.','Back up d4 with the e-pawn and open the king’s bishop.','The knight adds another attacker to d4.','Add a pawn defender. After an exchange on d4 you can maintain a pawn in the center.']
 },
 qg: {
  notes:['Occupy d4 and open the queen’s bishop.','The pawn on d5 stops White from freely pushing e4. White can challenge this central pawn using the c-pawn.','Offer a flank pawn to draw Black’s d-pawn away from the center.','Black declines and supports d5 with e6.','Develop with extra pressure on d5.','Black reinforces d5 and prepares to castle.'],
  title:'Queen’s Gambit Accepted',fork:3,moves:['d5c4','g1f3','g8f6','e2e3','e7e6','f1c4'],
  branch:['Black takes on c4 and gives up the central d5 pawn.','Develop and control e5 while keeping your central pawn.','Black develops and controls e4.','Open your bishop’s route to c4 and reinforce d4.','Black prepares to develop the f8 bishop.','Recover the pawn while developing the bishop. Your king can castle next.']
 },
 caro: {
  notes:['White claims space on e4.','You want to challenge e4 with …d5. Preparing with …c6 means that if White takes on d5, your c-pawn can recapture and stay in the center.','White builds a two-pawn center.','Strike at e4 immediately.','White develops and reinforces e4.','Trade on e4 to open the diagonal for your c8 bishop.','White recaptures with a centralized knight.','Develop the light-squared bishop with tempo against e4 before playing e6.'],
  title:'Advance Variation',fork:4,moves:['e4e5','c8f5','g1f3','e7e6'],
  branch:['White pushes past d5 and gains space. There is no longer a pawn to capture on e4.','Use the open diagonal now. Playing e6 first would shut your c8 bishop behind its own pawn chain.','White develops and reinforces the advanced pawn.','Support d5 once the bishop is outside the chain. Your next central lever is c5 against d4.']
 },
 french: {
  notes:['White occupies e4.','After …d5, White may capture on d5. The pawn on e6 can take back, so the queen need not come out early to recover the pawn.','White takes more central space.','Attack the e4 pawn.','White develops while defending e4.','Attack e4 again and invite the pawn to advance.','White gains space and attacks the knight, which must find a new square.'],
  title:'White advances on move three',fork:4,moves:['e4e5','c7c5','c2c3','b8c6'],
  branch:['White fixes the pawn chain before developing the queen’s knight.','Attack its base on d4. Taking space on the wing would let White consolidate.','White supports d4 with c3.','Develop another attacker toward d4. Your pressure is aimed at the base of the chain.']
 },
 sicilian: {
  notes:['White occupies e4.','The c5 pawn attacks d4. If White pushes the d-pawn there, you can trade a flank pawn for a central one and open the c-file for your rook.','White develops and prepares d4.','Control e5 and free the c8 bishop.','White challenges your c-pawn.','Exchange a flank pawn for a central pawn and open the c-file for later.','White recaptures with an active knight.','Develop with an attack on e4.'],
  title:'Alapin Variation',fork:2,moves:['c2c3','d7d5','e4d5','d8d5','d2d4','g8f6'],
  branch:['White prepares to build a pawn center with d4. The c3 square is occupied by a pawn.','Strike at e4 before White completes that center.','White trades off your d-pawn.','Recapture. White cannot immediately gain time with Nc3 because its own pawn occupies c3.','White establishes a pawn on d4.','Develop toward the center. You can keep the tension between c5 and d4.']
 },
 qgd: {
  notes:['White stakes out d4.','Meet the pawn in the center.','White offers the c-pawn to draw your d5 pawn away. If you play …dxc4, White can build a center while preparing to recover the pawn with a bishop.','Use the e-pawn to support d5.','White increases pressure on d5.','Develop and reinforce the central pawn.','White pins your knight to the queen.','Interpose the bishop to break the pin and prepare castling.'],
  title:'Exchange Variation',fork:6,moves:['c4d5','e6d5','c1g5','f8e7'],
  branch:['White resolves the tension on d5 before pinning the knight.','Recapture with the e-pawn. You restore central control and open the c8 bishop’s diagonal.','White pins the f6 knight to the queen.','Break the pin and clear the last square between king and rook for castling.']
 },
 slav: {
  notes:['White controls the center with d4.','Claim d5.','White challenges your d-pawn.','The pawn from c6 can recapture if White exchanges on d5. Because your e-pawn stays on e7, the bishop on c8 still has a diagonal toward f5.','White develops and reinforces d4.','Develop and bring another piece to the fight for e4.'],
  title:'Exchange Slav',fork:4,moves:['c4d5','c6d5','b1c3','g8f6'],
  branch:['White trades the c-pawn for your d-pawn.','Your c-pawn was supporting d5 for this recapture. Both sides now have a d-pawn and an open c-file.','White develops with pressure on d5.','Develop and defend d5 while keeping the light-squared bishop free.']
 }
};
