import { assert } from "chai";
import { CardManager, groupType } from "../bestGroup";

/*
https://www.technicalfeeder.com/2022/03/how-to-start-unit-testing-in-typescript-with-mocha-and-chai/
*/
const cardManager = new CardManager();

describe("Test best card formation", function () {
    describe("Some normal cases ", () =>{
        const handDeckTestCases : Array<any> =new Array(
            {
                cards: ['3.d',  '9.d',   '8.c',  '9.c',
                '2.h',  '10.d',  '10.c',  'J.c',
                '5.d',  '.j',  '5.s',  '5.h',  '.j'
                ], 
                joker : '2.s',
    
                formationResult : {
                    isValid: true,
                    score: 0,
                    names: [
                      '3.d.11.cd', '9.d.12.cd',
                      '8.c.1.cd',  '9.c.1.cd',
                      '2.h.11.jk', '10.d.12.cd',
                      '10.c.1.cd', 'J.c.1.cd',
                      '5.d.11.cd', '.j.12.jk',
                      '5.s.21.cd', '5.h.21.cd',
                      '.j.21.jk'
                    ],
                    groupIdToTypeMap:new Map <number, groupType> ( [[11, 'impSeq'  ],[12, 'impSeq'], [1,'seq'], [21, 'set'] ]  )
                  }
            },
            {
                cards: ['2.s',  '4.s',   '5.s',  '7.d',
                '8.d',  '9.d',  'A.c',  'K.c',
                'Q.c',  '6.c',  '6.c',  'Q.d',  '8.c'
                ], 
                joker : '6.s',
    
                formationResult : {
                    isValid: false,
                    score: 18,
                    names: [
                        '2.s.11.cd', '4.s.11.cd',
                        '5.s.11.cd', '7.d.2.cd',
                        '8.d.2.cd',  '9.d.2.cd',
                        'A.c.1.cd',  'K.c.1.cd',
                        'Q.c.1.cd',  '6.c.11.jk',
                        '6.c',       'Q.d',
                        '8.c'
                    ],
                    groupIdToTypeMap:new Map <number, groupType> ( [[11, 'impSeq'  ],[2, 'seq'], [1,'seq'], [null, 'inv'] ]  )
                  }
    
            },
            {
                cards: ['7.h',  'J.d',   'J.h',  'Q.c',
                '9.d',  '9.h',  '3.c',  '4.s',
                '10.d',  '10.h',  '7.c',  '9.s',  '9.s'
                ], 
                joker : '6.h',
    
                formationResult : {
                    isValid: false,
                    score: 49,
                    names: [
                        '7.h',       'J.d.1.cd',
                        'J.h.2.cd',  'Q.c',
                        '9.d.1.cd',  '9.h.2.cd',
                        '3.c',       '4.s',
                        '10.d.1.cd', '10.h.2.cd',
                        '7.c',       '9.s',
                        '9.s'
                    ],
                    groupIdToTypeMap:new Map <number, groupType> ( [[undefined, 'inv'  ],[2, 'seq'], [1,'seq'] ]  )
                }
            }
        );
        handDeckTestCases.forEach( (deck, i) =>{
            it(`test ${i}`, function () {
                assert.deepEqual(cardManager.bestGrouping( deck.cards, deck.joker ), deck.formationResult);
            });
        })
    });

    describe("Cases to be added " , () =>{

    });
});


describe("Test Valid card formation", () =>{

    describe("Some normal cases", () =>{

        const declarationTestCases : Array<any> = new Array(
            {
                cards :[ 
                    '3.d.11', '9.d.12',
                    '8.c.1',  '9.c.1',
                    '2.h.11', '10.d.12',
                    '10.c.1', 'J.c.1',
                    '5.d.11', '.j.12',
                    '5.s.21', '5.h.21',
                    '.j.21'
                 ] , 
                 joker : '2.s',
                 
                 formationResult : {
                    isValid: true,
                    score: 0,
                    names: [
                      '3.d.11.cd', '9.d.12.cd',
                      '8.c.1.cd',  '9.c.1.cd',
                      '2.h.11.jk', '10.d.12.cd',
                      '10.c.1.cd', 'J.c.1.cd',
                      '5.d.11.cd', '.j.12.jk',
                      '5.s.21.cd', '5.h.21.cd',
                      '.j.21.jk'
                    ],
                    groupIdToTypeMap:new Map <number, groupType> ( [[11, 'impSeq'  ],[12, 'impSeq'], [1,'seq'], [21, 'set'] ]  )
                  }
            },
            {
                cards: [
                    '2.s.11', '4.s.11','5.s.11', '7.d.2','8.d.2',  '9.d.2',
                    'A.c.1',  'K.c.1','Q.c.1',  '6.c.11','6.c.21',  'Q.d.21','8.c.21'
                ],
                joker : '6.s',
                formationResult:{
                    names:[
                        '2.s.11.cd', '4.s.11.cd','5.s.11.cd', '7.d.2.cd','8.d.2.cd',  '9.d.2.cd',
                        'A.c.1.cd',  'K.c.1.cd','Q.c.1.cd',  '6.c.11.jk','6.c.21', 'Q.d.21','8.c.21'
                    ],
                    score: 18,
                    isValid: false,
                    groupIdToTypeMap:new Map <number, groupType> ( [[2, 'seq'], [1,'seq'], [11, 'impSeq'] ]  )

                }
            },
            {
                cards:[
                    '7.h.12',       'J.d.1',
                    'J.h.2.11',  'Q.c.12',
                    '9.d.1.11',  '9.h.2',
                    '3.c.11',       '4.s.12',
                    '10.d.1', '10.h.2',
                    '7.c.11',       '9.s.12',
                    '9.s.12'
                ],
                joker :'6.h',
                formationResult :  {
                    isValid: false,
                    score: 49,
                    names: [
                        '7.h.12',       'J.d.1.cd',
                        'J.h.2.cd',  'Q.c.12',
                        '9.d.1.cd',  '9.h.2.cd',
                        '3.c.11',       '4.s.12',
                        '10.d.1.cd', '10.h.2.cd',
                        '7.c.11',       '9.s.12',
                        '9.s.12'
                    ],
                    groupIdToTypeMap:new Map <number, groupType> ( [[2, 'seq'], [1,'seq'] ]  )
                }
            },

            {
                cards:[
                    '10.s.1', 'Q.s.1',
                    '2.d.2', '8.d.2',
                    '10.d.2',  'K.c.3',
                    'K.s.3',  'K.h.3',
                    'Q.h.4',  'A.s.4',
                    'A.c.4',       'K.c.5',
                    '10.c.5'
                ],
                joker :'2.s',
                formationResult :  {
                    isValid: false,
                    score: 80,
                    names: [
                        '10.s.1',    'Q.s.1',
                        '2.d.2.jk',  '8.d.2.cd',
                        '10.d.2.cd', 'K.c.3.cd',
                        'K.s.3.cd',  'K.h.3.cd',
                        'Q.h.4',     'A.s.4',
                        'A.c.4',     'K.c.5',
                        '10.c.5'
                    ],
                    groupIdToTypeMap:new Map <number, groupType> ( [[2, 'impSeq'], [3,'set'] ]  )
                },
                description: "only impure seq and set"
            },

            {
                cards:[
                    'A.c.1','A.h.1', 'A.d.1', '3.c.2', '4.c.2' , '5.c.2',
    '8.c.3' , '9.h.3', 'Q.d.3' , '10.h.3' , '10.h.3' , '6.d.4', '8.c.4'
                ],
                joker :'7.d',
                formationResult :  {
                    isValid: false,
                    score: 80,
                    names: [
                        'A.c.1.cd', 'A.h.1.cd',
                        'A.d.1.cd', '3.c.2.cd',
                        '4.c.2.cd', '5.c.2.cd',
                        '8.c.3',    '9.h.3',
                        'Q.d.3',    '10.h.3',
                        '10.h.3',   '6.d.4',
                        '8.c.4'
                    ],
                    groupIdToTypeMap:new Map <number, groupType> ( [[2, 'seq'], [1,'set'] ]  )
                },
                description: "one pure seq and one set"
            },

            {
                cards:[
                    '2.h.1', '5.h.1','4.h.1','6.h.1','5.d.2', '7.d.2','9.d.2',
                    '5.c.3', '6.c.3', '7.c.3', '9.c.4', '7.s.4', '3.s.4'
                ],
                joker :'2.h',
                formationResult :  {
                    isValid: false,
                    score: 40,
                    names: [
                        '2.h.1.jk', '5.h.1.cd',
                        '4.h.1.cd', '6.h.1.cd',
                        '5.d.2',    '7.d.2',
                        '9.d.2',    '5.c.3.cd',
                        '6.c.3.cd', '7.c.3.cd',
                        '9.c.4',    '7.s.4',
                        '3.s.4'
                    ],
                    groupIdToTypeMap:new Map <number, groupType> ( [[3, 'seq'], [1,'impSeq'] ]  )
                },
                description: "one pure seq and one impure seq"
            },

            {
                cards:[
                    '3.s.1','6.d.1' , '3.s.2','2.h.2','4.d.2',  'J.d.3', 'Q.d.3','K.d.3','A.d.3',
                    '5.h.4','3.d.4','3.h.4','4.c.4'
                ],
                joker :'A.s',
                formationResult :  {
                    isValid: false,
                    score: 33,
                    names: [
                        '3.s.1',    '6.d.1',
                        '3.s.2',    '2.h.2',
                        '4.d.2',    'J.d.3.cd',
                        'Q.d.3.cd', 'K.d.3.cd',
                        'A.d.3.cd', '5.h.4',
                        '3.d.4',    '3.h.4',
                        '4.c.4'
                    ],
                    groupIdToTypeMap:new Map <number, groupType> ( [[3, 'seq'] ]  )
                },
                description: "one pure seq only"
            }
        );
        declarationTestCases.forEach( (declaration, i) =>{
            it(`test ${i} - ${declaration.description}`, function () {
                assert.deepEqual(cardManager.checkDeclarationAndScore( declaration.cards, declaration.joker ), declaration.formationResult);
            });
        })
    });

})

/*

1. one pure seq, one impure seq- add from remaining cards
2. one pure seq, one set - direct 80
3. one impure seq, one set - direct 80
4. one pure seq -- add from remaining cards
*/