"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardManager = exports.CardDeck = exports.Card = void 0;
class Card {
    constructor(id) {
        this.joker = false;
        this.wildJoker = false;
        this.isUsed = false;
        this.usedAs = null;
        this.markJoker = (jokerCard) => {
            if (this.joker)
                return;
            if (jokerCard.joker && this.rank == 'A') {
                this.wildJoker = true;
                return;
            }
            if (jokerCard.rank == this.rank) {
                //console.log('joker marked', this.name);
                this.wildJoker = true;
                return;
            }
        };
        this.name = id;
        const params = id.split(".");
        this.suit = params[1];
        this.rank = params[0];
        if (params.length > 2) {
            this.groupId = parseInt(params[2]);
            //this.isUsed = true;
        }
        if (params.length > 3) {
            this.usedAs = params[3];
        }
        if (this.rank == '') {
            this.val = this.score = 0; // for id j
            this.joker = true;
        }
        else if (this.rank == 'K' || this.rank == 'Q' || this.rank == 'A' || this.rank == 'J') {
            this.val = this.score = 10;
            if (this.rank == 'J')
                this.pos = 11;
            if (this.rank == 'Q')
                this.pos = 12;
            if (this.rank == 'K')
                this.pos = 13;
            if (this.rank == 'A')
                this.pos = 14;
        }
        else {
            this.pos = this.val = parseInt(this.rank);
        }
    }
    setCardInGroup(groupId, usedAsjoker) {
        var _a, _b;
        if ((_b = (_a = this.cardDeck) === null || _a === void 0 ? void 0 : _a.cardManager) === null || _b === void 0 ? void 0 : _b.foundValidDeclaration)
            return;
        this.groupId = groupId;
        this.usedAs = usedAsjoker ? 'jk' : 'cd';
        this.isUsed = true;
        this.name = `${this.rank}.${this.suit}.${this.groupId}.${this.usedAs}`;
    }
    removeCardFromGroup() {
        this.groupId = null;
        this.usedAs = null;
        this.isUsed = false;
        this.name = `${this.rank}.${this.suit}`;
    }
}
exports.Card = Card;
class CardDeck {
    constructor(cards, joker) {
        this.pureSeqId = 0;
        this.impureSeqId = 10; // start from 10 for no overlapp
        this.setId = 20;
        this.noOfCards = 0;
        //constructor( cardName : Array< name> , joker : name){}
        this.setCardManager = (cardMan) => {
            this.cardManager = cardMan;
            return;
        };
        this.getCardByUid = (uid) => {
            /*
            const index = this.cards.findIndex( (card) => card.uId == uid );
            if( index>= 0 ){
                return this.cards[index];
            }
            */
            return this.cards[uid];
        };
        // not used
        this.getPureSeq = () => {
            console.log('pss', this.pureSeqs.size, this.pureSeqId);
            if (this.pureSeqs.size == this.pureSeqId)
                return this.pureSeqs;
            for (let i = 1; i <= this.pureSeqId; i++) {
                this.pureSeqs.set(i, this.cards.filter(card => card.groupId == i));
            }
            return this.pureSeqs;
        };
        // not used
        this.getImPureSeq = () => {
            if (this.impureSeqs.size == this.impureSeqId - 10)
                return this.impureSeqs;
            for (let i = 11; i <= this.impureSeqId; i++) {
                this.impureSeqs.set(i, this.cards.filter(card => card.groupId == i));
            }
            return this.impureSeqs;
        };
        // not used
        this.getSet = () => {
            if (this.sets.size == this.setId - 20)
                return this.sets;
            for (let i = 21; i <= this.setId; i++) {
                this.sets.set(i, this.cards.filter(card => card.groupId == i));
            }
            return this.sets;
        };
        this.getScore = () => {
            let score = 0;
            for (const card of this.cards) {
                if (!card.isUsed && !(card.joker || card.wildJoker)) {
                    score += card.val;
                }
            }
            return score;
        };
        if (joker instanceof Card) {
            this.joker = joker;
        }
        else {
            this.joker = new Card(joker);
        }
        if (cards[0] instanceof Card) {
            this.cards = cards;
        }
        else {
            this.cards = cards.map(card_name => new Card(card_name));
        }
        this.cards.forEach(card => {
            card.uId = this.noOfCards++;
            card.cardDeck = this;
        });
        this.cards.forEach(card => card.markJoker(this.joker));
        this.pureSeqs = new Map();
        this.impureSeqs = new Map();
        this.sets = new Map();
    }
}
exports.CardDeck = CardDeck;
class CardManager {
    constructor() {
        this.suits = ["club", "diamond", "heart", "spade", "joker"];
        this.maxSizeOfSet = 4; // could be changed to 4 depending upon the rules
        this.sizeAndMaxElementToCombMap = new Map();
        this.minScore = 80;
        this.foundValidDeclaration = false;
        this.sortFn = (card1, card2) => {
            const diff = card1.pos - card2.pos;
            if (diff != 0)
                return diff;
            card1.rank;
            return diff;
        };
        this.checkSet = (cards) => {
            //console.log("check for set", cards.map(c =>c.name));
            if (cards.length < 3 || cards.length > this.maxSizeOfSet)
                return false;
            // if all jokers then it is a set
            let non_joker_ind = -1;
            for (let i = 0; i < cards.length; i++) {
                if (!(cards[i].joker || cards[i].wildJoker)) {
                    non_joker_ind = i;
                    break;
                }
            }
            //console.log(non_joker_ind, "nji")
            if (non_joker_ind == -1)
                return true; // found no non joker, so all jokers so set
            // all cards should should be of same pos or joker
            // first find a non joker 
            let comm_pos = cards[non_joker_ind].pos; // all cards should have the same pos as comm_pos or joker then set
            //console.log(comm_pos, "comm_pos")
            let ok = true;
            for (let i = 0; i < cards.length; i++) {
                if (!(cards[i].pos == comm_pos || cards[i].joker || cards[i].wildJoker))
                    ok = false;
            }
            //console.log(ok, "ok")
            if (ok)
                return true;
            return false;
        };
        this.checkImpureSeq = (cards) => {
            //console.log("check for imps", cards.map(c =>c.name));
            if (cards.length < 3)
                return false;
            let non_joker_ind = -1;
            for (let i = 0; i < cards.length; i++) {
                if (!(cards[i].joker || cards[i].wildJoker)) {
                    non_joker_ind = i;
                    break;
                }
            }
            if (non_joker_ind == -1)
                return true; // found no non joker, so all jokers so set
            // all non joker cards should be of the same suit and joker cards should fill the gaps
            let comm_suit = cards[non_joker_ind].suit;
            //console.log("comm_suit", comm_suit);
            let allCommonSuit = true;
            let pos_arr = [];
            let noOfJokers = 0;
            for (let i = 0; i < cards.length; i++) {
                if (!(cards[i].joker || cards[i].wildJoker)) {
                    allCommonSuit = allCommonSuit && (cards[i].suit == comm_suit);
                    pos_arr.push(cards[i].pos);
                }
                else
                    noOfJokers++;
            }
            if (!allCommonSuit)
                return false;
            pos_arr.sort((i, j) => i - j);
            let jokersNeeded = 0;
            for (let i = 1; i < pos_arr.length; i++) {
                jokersNeeded += pos_arr[i] - pos_arr[i - 1] - 1;
            }
            if (jokersNeeded <= noOfJokers)
                return true;
            return false;
        };
        this.checkPureSeq = (cards) => {
            if (cards.length < 3)
                return false;
            const currentSuit = cards[0].suit;
            //console.log("suit", currentSuit);
            if (!(currentSuit == 'c' || currentSuit == 'd' || currentSuit == 'h' || currentSuit == 's'))
                return false; // to not allow 3 or more jokers
            let allSameSuit = true;
            for (let i = 0; i < cards.length; i++) {
                allSameSuit = allSameSuit && (cards[i].suit == currentSuit);
            }
            //console.log(currentSuit, allSameSuit);
            if (!allSameSuit)
                return false;
            // test 8,9,10  K,Q,A  10,J,Q  A,2,3
            cards.sort(this.sortFn);
            //console.log( cards.map(c =>c.name));
            let diff = 0;
            for (let i = 1; i < cards.length; i++) {
                diff += cards[i].pos - cards[i - 1].pos - 1;
            }
            //console.log(currentSuit, diff);
            if (diff == 0)
                return true;
            // handling for A,2,3
            let pos_arr = cards.map(card => {
                if (card.pos == 14)
                    return 1;
                else
                    return card.pos;
            }).sort((i, j) => i - j);
            diff = 0;
            for (let i = 1; i < pos_arr.length; i++) {
                diff += pos_arr[i] - pos_arr[i - 1] - 1;
            }
            if (diff == 0)
                return true;
            return false;
        };
        this.splitBySuit = (cards) => {
            const groupedDeck = new Map([
                [this.suits[0], cards.filter(card => card.suit == 'c')],
                [this.suits[1], cards.filter(card => card.suit == 'd')],
                [this.suits[2], cards.filter(card => card.suit == 'h')],
                [this.suits[3], cards.filter(card => card.suit == 's')],
                [this.suits[4], cards.filter(card => card.suit == 'j')]
            ]);
            return groupedDeck;
        };
        this.splitAndSortByPos = (cards) => {
            let groupedDeck = new Map();
            for (let p = 2; p <= 14; p++) {
                groupedDeck.set(p, cards.filter(c => c.pos == p));
            }
            return groupedDeck;
        };
        this.splitAndSort = (cards) => {
            const groupedDeck = this.splitBySuit(cards);
            groupedDeck.forEach((suitCards) => {
                suitCards.sort(this.sortFn);
            });
            return groupedDeck;
        };
        this.getSizeAndMaxElementToCombMap = (s) => {
            for (let i = 0; i <= s; i++) {
                if (!this.sizeAndMaxElementToCombMap.get(i)) {
                    let arr = [];
                    for (let j = 0; j < i; j++)
                        arr.push(j);
                    this.sizeAndMaxElementToCombMap.set(i, this.combinations(arr, i));
                }
            }
            return this.sizeAndMaxElementToCombMap;
        };
        this.getCombinationsMap = (mxComb) => {
            let arr = [];
            let sizeToCombMap = new Map();
            for (let i = 0; i < mxComb; i++) {
                arr.push(i);
            }
            const allComb = this.combinations(arr, 0);
            allComb.forEach(comb => {
                if (sizeToCombMap.get(comb.length)) {
                    sizeToCombMap.get(comb.length).push(comb);
                }
                else {
                    sizeToCombMap.set(comb.length, [comb]);
                }
            });
            return sizeToCombMap;
        };
        this.setbestFormation = (cardDeck) => {
            cardDeck.cards.forEach(c => {
                this.bestFormation.set(c.uId, c.groupId);
            });
            this.bestFormationNames = cardDeck.cards.map(card => card.name);
        };
        this.findPureImpureSeqOrSet = (cardDeck) => {
            let res = 0;
            if (this.foundValidDeclaration)
                return;
            const pureSeqIterator = this.generatePureSeq(cardDeck);
            for (const p1 of pureSeqIterator) {
                if (this.foundValidDeclaration)
                    return;
                res++;
                this.findPureImpureSeqOrSet(cardDeck);
            }
            const impPureSeqIterator = this.generateAnySeq(cardDeck);
            for (const p1 of impPureSeqIterator) {
                if (this.foundValidDeclaration)
                    return;
                res++;
                this.findPureImpureSeqOrSet(cardDeck);
            }
            const setIterator = this.generateSets(cardDeck);
            for (const s of setIterator) {
                if (this.foundValidDeclaration)
                    return;
                res++;
                this.findPureImpureSeqOrSet(cardDeck);
            }
            if (res == 0) {
                const scoreOfCurrentFormation = cardDeck.getScore();
                if (this.minScore > scoreOfCurrentFormation) {
                    this.minScore = scoreOfCurrentFormation;
                    this.setbestFormation(cardDeck);
                    if (scoreOfCurrentFormation == 0) {
                        this.foundValidDeclaration = true;
                    }
                }
            }
        };
        this.checkDeclarationAndScore = (cards, joker) => {
            // card.name = "2.h.2" cards will be marked
            // score will be minimum of  80 and the score of deck 
            /*
    
                1. one pure seq, one impure seq- add from remaining cards
                2. one pure seq, one set - direct 80
                3. one impure seq, one set - direct 80
                4. one pure seq -- add from remaining cards
            */
            const cardDeck = new CardDeck(cards, joker);
            const groupIdCardMap = new Map();
            cardDeck.cards.forEach(card => {
                if (!groupIdCardMap.get(card.groupId)) {
                    groupIdCardMap.set(card.groupId, [card]);
                }
                else {
                    groupIdCardMap.get(card.groupId).push(card);
                }
            });
            let pureSeqGroupIds = [];
            let imPureSeqGroupIds = [];
            let setGroupIds = [];
            let noOfGroups = 0;
            groupIdCardMap.forEach((cardsOfGroup, groupId) => {
                noOfGroups++;
                //console.log("group   ", groupId, cardsOfGroup.map( card => card.name));
                if (this.checkPureSeq(cardsOfGroup)) {
                    //console.log("pure   ", groupId);
                    pureSeqGroupIds.push(groupId);
                }
                if (this.checkImpureSeq(cardsOfGroup)) {
                    //console.log("impure   ", groupId);
                    imPureSeqGroupIds.push(groupId);
                }
                if (this.checkSet(cardsOfGroup)) {
                    //console.log("set   ", groupId);
                    setGroupIds.push(groupId);
                }
            });
            let groupIdToTypeMap = new Map();
            let isValid = false;
            let score = 80;
            let count = {
                pureSeq: 0,
                impureSeq: 0,
                sets: 0
            };
            let directPenalty = false; // required for knowing when to give direct penalty
            // doing setCardInGroup as now they are part of the group, needed for calculating the score correctly
            // first take the group to be a pure seq , then an impure seq, then a set  
            const groupTypeFound = {
                seq: false,
                impSeq: false, set: false
            };
            pureSeqGroupIds.forEach(groupId => {
                if (!groupIdToTypeMap.has(groupId)) {
                    groupTypeFound.seq = true;
                    groupIdToTypeMap.set(groupId, 'seq');
                    groupIdCardMap.get(groupId).forEach(card => card.setCardInGroup(groupId, false)); // joker never considered in pure seq
                    count.pureSeq++;
                }
            });
            imPureSeqGroupIds.forEach(groupId => {
                if (!groupIdToTypeMap.has(groupId)) {
                    groupTypeFound.impSeq = true;
                    if (!groupTypeFound.seq) {
                        directPenalty = true;
                    }
                    groupIdToTypeMap.set(groupId, 'impSeq');
                    groupIdCardMap.get(groupId).forEach(card => card.setCardInGroup(groupId, card.joker || card.wildJoker)); // if it is a joker, no harm in considering it as one
                    count.impureSeq++;
                }
            });
            setGroupIds.forEach(groupId => {
                if (!groupIdToTypeMap.has(groupId)) {
                    if (!groupTypeFound.seq || !groupTypeFound.impSeq) {
                        directPenalty = true;
                    }
                    groupIdToTypeMap.set(groupId, 'set');
                    groupIdCardMap.get(groupId).forEach(card => card.setCardInGroup(groupId, card.joker || card.wildJoker));
                    count.sets++;
                }
            });
            if (count.pureSeq >= 1 && count.impureSeq + count.pureSeq >= 2 && (count.impureSeq + count.pureSeq + count.sets == noOfGroups)) {
                isValid = true;
                score = 0;
            }
            else {
                //console.log("here", cardDeck.getScore());
                isValid = false;
                if (directPenalty)
                    score = 80;
                else
                    score = Math.min(score, cardDeck.getScore());
            }
            const bestFormation = {
                isValid,
                groupIdToTypeMap,
                score,
                names: cardDeck.cards.map(card => card.name)
            };
            return bestFormation;
        };
        this.bestGrouping = (cards, joker) => {
            // first find all the possible pure sequences, then for each pure sequence find the impure sequence from remaining cards
            // from the remaining cards make either pure/impure sequences or sets
            // for pure sequence find consecutive groups of atleast 3 
            // for impure sequence loop between all possible comb jokers and all possible comb of cards of same suit such that missing places are filled by those jokers, atleast 3 
            const cardDeck = new CardDeck(cards, joker);
            cardDeck.setCardManager(this);
            this.foundValidDeclaration = false;
            this.minScore = 80;
            this.bestFormation = new Map();
            const pureSeqIterator = this.generatePureSeq(cardDeck);
            for (const p1 of pureSeqIterator) {
                //console.log( "pureSeq", cardDeck.getPureSeq().get(1).map( c => c.name ) );
                if (this.foundValidDeclaration)
                    break;
                const impPureSeqIterator = this.generateAnySeq(cardDeck);
                for (const p2 of impPureSeqIterator) {
                    if (this.foundValidDeclaration)
                        break;
                    this.findPureImpureSeqOrSet(cardDeck);
                    //console.log( "impure seq  ======>>>",  cardDeck.getImPureSeq().get(11).map( c => c.name ) );
                }
                //console.log( "PURE SEQUENCES", cardDeck.cards.filter( c=> !c.isUsed).length);
                const pureSeqIterator2 = this.generatePureSeq(cardDeck);
                for (const p2 of pureSeqIterator2) {
                    if (this.foundValidDeclaration)
                        break;
                    //console.log( "pure seq ",  cardDeck.getPureSeq().get(2).map( c => c.name ) );
                    this.findPureImpureSeqOrSet(cardDeck);
                }
            }
            const groupIdToTypeMap = new Map();
            this.bestFormation.forEach((groupId, uId) => {
                if (typeof groupId == 'number') {
                    if (groupId < 10) {
                        groupIdToTypeMap.set(groupId, "seq");
                    }
                    else if (groupId < 20) {
                        groupIdToTypeMap.set(groupId, "impSeq");
                    }
                    else if (groupId < 30) {
                        groupIdToTypeMap.set(groupId, "set");
                    }
                }
                else {
                    groupIdToTypeMap.set(groupId, "inv");
                }
            });
            const formationResult = {
                isValid: this.foundValidDeclaration,
                score: this.minScore,
                names: this.bestFormationNames,
                groupIdToTypeMap: groupIdToTypeMap
            };
            return formationResult;
        };
        // to be implemented
        this.bestCardToDiscard = (cards, joker) => {
            // given a deck of 14 cards find the card to discard for best formation
            return;
        };
        // to be implemented
        this.bestNextMove = (cards, joker) => {
            // given a deck of 13 cards from user find the best next move-- find the best formation,
            // compare given formation with best, give the move based on the first different group
            return;
        };
    }
    *generateSets(cardDeck) {
        let allCards = cardDeck.cards;
        allCards = allCards.filter(card => !card.isUsed);
        const posGroups = this.splitAndSortByPos(allCards);
        let jokers = [];
        allCards.forEach((card) => {
            if (!card.isUsed && (card.joker || card.wildJoker))
                jokers.push(card);
        });
        let mx_s = 0;
        posGroups.forEach(grp => mx_s = Math.max(mx_s, grp.length));
        let sizeAndMaxElementToCombMap = this.getSizeAndMaxElementToCombMap(mx_s);
        let sizeToCombMap = this.getCombinationsMap(jokers.length);
        //posGroups.forEach( grp => console.log( "val group  ", grp.map( c =>c.name )));
        const mx_nj = Math.min(this.maxSizeOfSet, jokers.length); // max no of jokers should be smaller than maxSizeOfSet
        for (let nj = 0; nj <= mx_nj; nj++) {
            //console.log("JOKER == ", nj);
            for (let v = 0; v <= 14; v++) {
                const cards = posGroups.get(v);
                if (!cards)
                    continue;
                let uniqCards = []; // unique suits
                cards.forEach(card => {
                    if (uniqCards.findIndex((c) => (c.suit == card.suit)) == -1) {
                        uniqCards.push(card);
                    }
                });
                //console.log("FOR POS", v, uniqCards.length);
                // finding disjoint sets of combination of uniqCards and jokers
                // nj jokers are there, so we need atleast max(0, 3-nj ) cards to for a set
                for (let nc = Math.max(0, 3 - nj); nc + nj <= this.maxSizeOfSet && nc <= uniqCards.length; nc++) {
                    //console.log( "nc and nj ", nc, nj);
                    const combWithEqSize = this.sizeAndMaxElementToCombMap.get(nc);
                    const jokerCombWithEqSize = sizeToCombMap.get(nj);
                    for (let i = 0; i < combWithEqSize.length; i++) {
                        const card_comb = combWithEqSize[i];
                        for (let j = 0; j < jokerCombWithEqSize.length; j++) {
                            const joker_comb = jokerCombWithEqSize[j];
                            //console.log( "chkkkk" ,card_comb, uniqCards.length)
                            const card_uid = card_comb.map(x => uniqCards[x].uId);
                            const joker_uid = joker_comb.map(x => jokers[x].uId);
                            if (this.checkDisjoint(card_uid, joker_uid)) {
                                cardDeck.setId++;
                                card_comb.forEach(x => {
                                    uniqCards[x].setCardInGroup(cardDeck.setId, false);
                                    /*
                                    uniqCards[x].groupId = cardDeck.setId;
                                    uniqCards[x].isUsed = true;
                                    uniqCards[x].usedAs = 'cd';
                                    */
                                });
                                joker_comb.map(x => {
                                    jokers[x].setCardInGroup(cardDeck.setId, true);
                                    /*
                                    jokers[x].groupId = cardDeck.setId;
                                    jokers[x].isUsed = true;
                                    jokers[x].usedAs = 'jk';
                                    */
                                });
                                yield allCards;
                                cardDeck.setId--;
                                card_comb.forEach(x => {
                                    uniqCards[x].removeCardFromGroup();
                                    /*
                                    uniqCards[x].groupId = null;
                                    uniqCards[x].isUsed = false;
                                    uniqCards[x].usedAs = null;
                                    */
                                });
                                joker_comb.map(x => {
                                    jokers[x].removeCardFromGroup();
                                    /*
                                    jokers[x].groupId = null;
                                    jokers[x].isUsed = false;
                                    jokers[x].usedAs = null;
                                    */
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    *generatePureSeq(cardDeck) {
        let allCards = cardDeck.cards;
        allCards = allCards.filter(card => !card.isUsed);
        const suitGroups = this.splitAndSort(allCards);
        for (let i = 0; i < 4; i++) {
            const cards = suitGroups.get(this.suits[i]);
            let l = 0, prevCard = null;
            while (l < cards.length) {
                //console.log(l)
                if (prevCard && prevCard.pos == cards[l].pos) {
                    l++;
                    continue;
                }
                else {
                    prevCard = cards[l];
                }
                let r = l + 1, prevVal = cards[l].pos;
                const maxInSeq = [l];
                //console.log(prevVal);
                if (prevVal == 14) { // if card is 'A' then we can also make seq like A,2,3
                    r = 0;
                    prevVal = 1;
                }
                while (r < cards.length) {
                    //console.log(prevVal, cards[r].pos, "cv");
                    if (cards[r].pos == prevVal + 1) {
                        maxInSeq.push(r);
                        prevVal = cards[r].pos;
                    }
                    else if (cards[r].pos > prevVal + 1)
                        break;
                    r++;
                }
                ///console.log("maxInSeq", maxInSeq.map( c => cards[c].name));
                if (maxInSeq.length >= 3) {
                    let i = 2;
                    const chosenCards = [maxInSeq[0], maxInSeq[1]];
                    cardDeck.pureSeqId++;
                    while (i < maxInSeq.length) {
                        chosenCards.push(maxInSeq[i]);
                        // mark them
                        chosenCards.forEach(k => {
                            cards[k].setCardInGroup(cardDeck.pureSeqId, false);
                            //cards[k].isUsed = true; cards[k].groupId = cardDeck.pureSeqId
                        });
                        yield allCards;
                        // unmark them 
                        chosenCards.forEach(k => {
                            cards[k].removeCardFromGroup();
                            //cards[k].isUsed = false; cards[k].groupId = null;
                        });
                        i++;
                    }
                    cardDeck.pureSeqId--;
                }
                l++;
            }
        }
        ;
    }
    combinations(arr, m) {
        const result = [];
        function backtrack(startIndex, currentCombination) {
            if (currentCombination.length >= m) {
                result.push([...currentCombination]);
            }
            for (let i = startIndex; i < arr.length; i++) {
                currentCombination.push(arr[i]);
                backtrack(i + 1, currentCombination);
                currentCombination.pop();
            }
        }
        backtrack(0, []);
        return result;
    }
    checkDisjoint(group1, group2) {
        //group1.
        for (const id1 of group1) {
            let t = group2.findIndex(id2 => id2 == id1);
            if (t >= 0) {
                return false;
            }
        }
        return true;
    }
    *generateAnySeq(cardDeck) {
        let allCards = cardDeck.cards;
        //console.log("filter ", allCards.map(c =>c.name));
        //console.log("filter ", allCards.map(c =>c.name));
        let jokersIndex = [];
        allCards.forEach((card, id) => {
            if (!card.isUsed && (card.joker || card.wildJoker))
                jokersIndex.push(card.uId);
        });
        const allJokerComb = this.combinations(jokersIndex, 1);
        let sizeToCombMap = new Map();
        allJokerComb.forEach(comb => {
            if (sizeToCombMap.get(comb.length)) {
                sizeToCombMap.get(comb.length).push(comb);
            }
            else {
                sizeToCombMap.set(comb.length, [comb]);
            }
        });
        //console.log( sizeToCombMap);
        allCards = allCards.filter(card => !card.isUsed);
        const suitGroups = this.splitAndSort(allCards.filter(card => !card.isUsed));
        for (let i = 0; i < 4; i++) {
            const cards = suitGroups.get(this.suits[i]); // group of cards of one suit
            let l = 0, prevCard = null;
            //console.log("cards of suit ", this.suits[i], cards.map(c => c.name));
            while (l < cards.length) {
                //console.log("starting from ", cards[l].name)
                if (prevCard && prevCard.pos == cards[l].pos) {
                    l++;
                    continue;
                }
                else {
                    prevCard = cards[l];
                }
                let r = l + 1, low = cards[l].pos;
                const maxInSeq = [cards[l].uId];
                //console.log(prevVal);
                if (low == 14) { // if card is 'A' then we can also make seq like A,2,3
                    r = 0;
                    low = 1;
                }
                // for all combinations of [low, high] such high-low-1 <= jokers 
                // for each combination, find the remaining jokers 
                // if no of remaining jokers> jokers needed for that combination, find all possible joker combination of size jokers_needed
                // combination + combination_of_joker is an impure seq
                let high = low;
                let last = cards[l].pos;
                while (r < cards.length) {
                    high = cards[r].pos;
                    if (high - low - 1 <= jokersIndex.length) {
                        if (last != high) {
                            // to prevent taking duplicates
                            maxInSeq.push(cards[r].uId);
                            last = high;
                        }
                    }
                    else
                        break;
                    r++;
                }
                //console.log( "ending at high", last);
                //generating all combinations
                const allComb = this.combinations(maxInSeq, 0);
                // nj - no of jokers, atleast 1 is req for impure seq
                for (let nj = 1; nj <= jokersIndex.length; nj++) {
                    //console.log("  no of jokers ", nj);
                    // going through all combinations of size atleast 3-nj 
                    for (let comb_ind = 0; comb_ind < allComb.length; comb_ind++) {
                        const cardComb = allComb[comb_ind];
                        const cardsInComb = cardComb.map(card_uid => cardDeck.getCardByUid(card_uid)).sort(this.sortFn);
                        let noOfJokersReq = 0;
                        for (let it = 1; it < cardsInComb.length; it++) {
                            noOfJokersReq = cardsInComb[it].pos - cardsInComb[it - 1].pos - 1;
                        }
                        //console.log("noOfJokersReq", noOfJokersReq, cardsInComb.map( c=>c.name));
                        if ((cardComb.length + nj) >= 3 && noOfJokersReq <= nj) {
                            //console.log(cardComb, cardComb.length , nj);
                            // taking only combinations of size nj
                            for (let joker_comb_id = 0; joker_comb_id < sizeToCombMap.get(nj).length; joker_comb_id++) {
                                // 
                                const jokerComb = sizeToCombMap.get(nj)[joker_comb_id];
                                // cardComb is comb of card_uid
                                // check if any wild joker is used as part of seq 
                                if (this.checkDisjoint(jokerComb, cardComb)) {
                                    //console.log(jokerComb, cardComb);
                                    cardDeck.impureSeqId++;
                                    cardComb.map(card_uid => cardDeck.getCardByUid(card_uid)).forEach(card => card.setCardInGroup(cardDeck.impureSeqId, false));
                                    jokerComb.map(card_uid => cardDeck.getCardByUid(card_uid)).forEach(card => card.setCardInGroup(cardDeck.impureSeqId, true));
                                    //console.log( "selectedCards " , selectedCards.map(c =>c.name))
                                    yield allCards;
                                    cardDeck.impureSeqId--;
                                    cardComb.map(card_uid => cardDeck.getCardByUid(card_uid)).forEach(card => card.removeCardFromGroup());
                                    jokerComb.map(card_uid => cardDeck.getCardByUid(card_uid)).forEach(card => card.removeCardFromGroup());
                                }
                            }
                        }
                    }
                }
                l++;
            }
        }
        ;
    }
}
exports.CardManager = CardManager;
// no 13 cards- don't test this
const cards1 = new Array(new Card('8d'), new Card('9d'), new Card('Jd'), new Card('Qd'), new Card('Kd'), new Card('Ad'), new Card('2d'), new Card('3d'), new Card('j'), new Card('5s'), new Card('3s'), new Card('7c'), new Card('8c'), new Card('9c'), new Card('10c'), new Card('As'), new Card('2s'), new Card('3s'));
const cards2 = new Array(new Card('3d'), new Card('9d'), new Card('8c'), new Card('9c'), new Card('2h'), new Card('10d'), new Card('10c'), new Card('Jc'), new Card('5d'), new Card('j'), new Card('5s'), new Card('5h'), new Card('j'));
const cards3 = new Array(new Card('2s'), new Card('4s'), new Card('5s'), new Card('7d'), new Card('8d'), new Card('9d'), new Card('Ac'), new Card('Kc'), new Card('Qc'), new Card('6c'), new Card('6c'), new Card('Qd'), new Card('8c'));
const cardTestCases = [
    new Array(new Card('3.d'), new Card('9.d'), new Card('8.c'), new Card('9.c'), new Card('2.h'), new Card('10.d'), new Card('10.c'), new Card('J.c'), new Card('5.d'), new Card('.j'), new Card('5.s'), new Card('5.h'), new Card('.j')),
    new Array(new Card('2.s'), new Card('4.s'), new Card('5.s'), new Card('7.d'), new Card('8.d'), new Card('9.d'), new Card('A.c'), new Card('K.c'), new Card('Q.c'), new Card('6.c'), new Card('6.c'), new Card('Q.d'), new Card('8.c')),
    new Array(new Card('7.h'), new Card('J.d'), new Card('J.h'), new Card('Q.c'), new Card('9.d'), new Card('9.h'), new Card('3.c'), new Card('4.s'), new Card('10.d'), new Card('10.h'), new Card('7.c'), new Card('9.s'), new Card('9.s')),
];
const jokers = [
    new Card('2.s'),
    new Card('6.s'),
    new Card('6.h')
];
const cm = new CardManager();
for (let i = 0; i < jokers.length; i++) {
    //console.log( cm.bestGrouping(cardTestCases[i], jokers[i]) );
}
//# sourceMappingURL=bestGroup.js.map