# Rummy Group

Finding the best grouping for rummy with 13 cards is very complex. 
The algorithm that finds the optimal card formation is in [`gp/bestGroup.ts`, line 849]
To demonstrate the working of algorithm I developed a light weight website to group the cards and get the optimal grouping.

Rules that needs to be followed-
1. Cards have to be grouped and a group consists of atleast 3 cards.
2. Groups are of 3 types, pure sequence, impure sequence and set. Check below what is the criteria for each.
3. Cards that are not part of any group will incur points equal to its face value, King, Queen, Jack, Ace will incur 10 points.
4. You have to group the cards such that the points are minimum.
5. If the cards are such that atleast 1 pure seq and 2 sequence can't be formed then automatically the points is 80 and you can try again.


## How to play

**Objective:** Arrange your 13 cards into sequences and sets to minimise your total points. Cards inside a valid group score zero — ungrouped cards count against you.

### 1. Draw a card
Click the **Deck** in the top-left to draw one card. You'll temporarily hold 14 cards.

### 2. Discard a card
Click the **×** that appears on any card to discard it. You're back to 13 cards. You must complete one draw-and-discard before you can submit. Repeat as many times as you like.

### 3. Arrange your cards
Drag cards between groups to form valid combinations. Use the **+ New group** button to create additional groups.

### Valid combinations

| Type | Rule | Example |
|---|---|---|
| Pure Sequence | 3+ consecutive cards, same suit, no joker | 5♠ 6♠ 7♠ |
| Impure Sequence | 3+ consecutive, same suit, joker fills a gap | 4♥ [Joker] 6♥ |
| Set | 3–4 cards of the same rank, different suits | 9♠ 9♥ 9♦ |

### Joker
The card shown next to the deck is the **wild joker**. Any card in your hand that shares its rank acts as a joker — it scores 0 points and can substitute any card in an impure sequence or set.

### Scoring
- A · J · Q · K = 10 pts
- Number cards (2–10) = face value
- Joker = 0 pts always
- Cards inside a valid group = 0 pts
- **Flat 80 penalty:** if your grouping doesn't have at least 1 pure sequence and at least 2 sequences in total, your score is a flat 80 pts regardless of everything else
- Score is capped at 80 pts

### 4. Submit
Once you've done at least one draw-and-discard, hit **Submit grouping**. You'll see your score and the best possible grouping the algorithm could find.

---

## Best grouping algorithm

The algorithm that finds the optimal card formation is in [`gp/bestGroup.ts`, line 849](gp/bestGroup.ts#L849) (`bestGrouping` method of `CardManager`). It explores all valid formations starting from a pure sequence and returns the one with the lowest score.
