/**
 * Name: Justin Clayton
 * Date: Aptil 17, 2020
 * Section: CSE 154 AD
 * This is the main js page to complete the logic for index.html.
 */

'use strict';
(function() {
  window.addEventListener('load', init);
  // Constants that define basic game function
  const SUITS = ['spade', 'heart', 'club', 'diamond'];
  const CARDS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];
  const GAME = {playerMoney: 500};
  const BET_AMOUNT = 25;

  /** This is that function to set up the webpage and set up game */
  function init() {
    id('start-btn').addEventListener('click', onStart);
    id('discard-btn').addEventListener('click', onDiscard);
    id('fold-btn').addEventListener('click', onResetOrFold);
    id('reset-btn').addEventListener('click', onResetOrFold);
    id('close-rules-btn').addEventListener('click', onToggleRules);
    id('open-rules-btn').addEventListener('click', onToggleRules);
    resetGameState();
    setFigureEvents();
  }


  // Event Listeners
  /**
   * This function handles the logic for selecting and deselecting cards to be discarded.
   * @param {event} e - The click event from the figure that contains the card
   * @param {number} index - The index of the card, left to right across screen
   */
  function onClickCard(e, index) {
    let imgEl = e.currentTarget.children[0];
    if (GAME.playerDiscard[index]) {
      setImg(GAME.playerHand[index], imgEl, true);
    } else {
      setImg(GAME.playerHand[index], imgEl, false);
    }
    GAME.playerDiscard[index] = !GAME.playerDiscard[index];
  }

  /** This function handles discarding selected cards and re dealing new ones. */
  function onDiscard() {
    id('game-menu').classList.add('hidden');
    id('end-menu').classList.remove('hidden');
    bet();
    GAME.playerDiscard.forEach( (isDiscarding, i) => {
      if (isDiscarding) {
        GAME.playerHand[i] = dealCard();
      }
    });
    refreshImages();
    showCpuCards();
    let winner = checkWinner();
    resolveGame(winner);
  }

  /** This function handles the logic for folding or reseting the game. */
  function onResetOrFold() {
    resetGameState();
    updateMoney();
    clearImages();
    id('start-menu').classList.remove('hidden');
    id('game-menu').classList.add('hidden');
    id('end-menu').classList.add('hidden');
  }

  /** This is the function to switch the menu when the game is started. */
  function onStart() {
    if (GAME.playerMoney >= 50) {
      id('start-menu').classList.add('hidden');
      id('game-menu').classList.remove('hidden');
      bet();
      deal();
    } else {
      createPopup();
    }
  }

  /** This function hides the rules text box. */
  function onToggleRules() {
    id('rules').classList.toggle('hidden');
  }

  // General function alphabetically sorted
  /** This function handles betting for starting or continuing each round. */
  function bet() {
    GAME.playerMoney -= BET_AMOUNT;
    GAME.pot += (2 * BET_AMOUNT);
    updateMoney();
  }

  /** This card deals the specified number of cards to each player, default is 5 and 5 */
  function deal() {
    for (let i = 1; i <= 5; i++) {
      let cpuCard = dealCard();
      GAME.cpuHand.push(cpuCard);
      let playerCard = dealCard();
      GAME.playerHand.push(playerCard);
    }
    refreshImages();
  }

  /**
   * This function is the logic for dealing just one card from the deck, each card is random and
   * should only be dealt once.
   * @return {object} - An object representing the number, suit, and face value of the card
   */
  function dealCard() {
    let card = {};
    let cardNum = Math.floor(Math.random() * 52);
    while (GAME.drawnCards.includes(cardNum)) {
      cardNum = Math.floor(Math.random() * 52);
    }
    GAME.drawnCards.push(cardNum);
    card.num = cardNum;
    card.suit = getSuit(cardNum);
    card.value = getCardValue(cardNum);
    return card;
  }

  /** This function clears out the card images between games. */
  function clearImages() {
    for (let i = 1; i <= 5; i++) {
      qs(`#cpu-card${i} img`).remove();
      qs(`#player-card${i} img`).remove();
    }
  }

  /** This function refreshes the images on the page. */
  function refreshImages() {
    for (let i = 1; i <= 5; i++) {
      let cpuImg = qs(`#cpu-card${i} img`);
      let playerImg = qs(`#player-card${i} img`);
      if (!cpuImg) {
        cpuImg = document.createElement('img');
        id(`cpu-card${i}`).appendChild(cpuImg);
      }
      if (!playerImg) {
        playerImg = document.createElement('img');
        id(`player-card${i}`).appendChild(playerImg);
      }
      setImg(GAME.cpuHand[i-1], cpuImg, false);
      setImg(GAME.playerHand[i-1], playerImg, true);
    }
  }

  /** This function intializes a new rounds game state. */
  function resetGameState() {
    GAME.drawnCards = [];
    GAME.cpuHand = [],
    GAME.cpuDiscard = [false, false, false, false, false];
    GAME.playerHand = [];
    GAME.playerDiscard = [false, false, false, false, false];
    GAME.pot = 0;
  }

  /**
   * This function handles paying the winner in the event of a win or tie.
   * @param {string} winner - 'player', 'cpu', or 'tie'
   */
  function resolveGame(winner) {
    if (winner === 'player') {
      GAME.playerMoney += GAME.pot;
    } else if (winner === 'tie') {
      GAME.playerMoney += GAME.pot / 2;
    }
    GAME.pot = 0;
    updateMoney();
  }

  /** This function shows the opponents cards after the discard round to see who won. */
  function showCpuCards() {
    for(let i = 1; i <= 5; i++) {
      let cpuImg = qs(`#cpu-card${i} img`);
      let cpuCard = GAME.cpuHand[i-1];
      setImg(cpuCard, cpuImg, true);
    }
  }

  /** This function sets the click events for selecting which cards to discard. */
  function setFigureEvents() {
    for (let i = 1; i <= 5; i++) {
      id(`player-card${i}`).addEventListener('click', (e) => {
        onClickCard(e, i-1);
      });
    }
  }

  /**
   * This function converts a number representing a card in a standard 52 card deck to one of the
   * images in the assets folder. Ordering is ace to king, in sets of spade, heart, club, diamond.
   * @param {number} cardNum - 0-51 definining the card in a standard deck as ordered above
   * @return {string} Image src file of the card
   */
  function setImg(card, imgEl, isShowing) {
    if (isShowing) {
      imgEl.src = `./assets/${card.suit}-${card.value}.png`;
      imgEl.alt = `The ${card.value} of ${card.suit}`;
    } else {
      imgEl.src = './assets/card-back.png';
      imgEl.alt = 'The back of a playing card';
    }
  }

  /** This function updates the amounts displayed to the user in their money and in the pot. */
  function updateMoney() {
    id('player-money').textContent = GAME.playerMoney;
    id('pot').textContent = GAME.pot;
  }

  // Logic for checking who won the game
  /**
   * This function checks the highest hand ranking of the hands and returns a string representing
   * the winner or if it is a tie.
   * @return {string} The winner of the game: 'cpu', 'player', or 'tie'
   */
  function checkWinner() {
    let cpuRank = checkHand(GAME.cpuHand);
    let playerRank = checkHand(GAME.playerHand);

    if (cpuRank.rank === playerRank.rank) {
      return breakTie(cpuRank, playerRank);
    } else if (cpuRank.rank > playerRank.rank) {
      return 'cpu';
    } else {
      return 'player';
    }
  }

  /**
   * This function checks for best possible poker hand and returns the max poker rank.
   * @param {object} hand - The hand being checked.
   * @return {object} An object representing the possible poker hands with a valued ranking
   */
  function checkHand(hand) {
    let straightFlushRank = checkStraightOrFlush(hand);
    let multiplesRank = checkMultiples(hand);
    if (straightFlushRank.rank > multiplesRank.rank) {
      return straightFlushRank;
    } else {
      return multiplesRank;
    }
  }

  /**
   * This function breaks a tie for equal hand rankings, checking which player has higher of the
   * best ranked card in the poker hand cards.
   * @param {object} cpuRank - The rank and high/pair values of the cpu hand.
   * @param {object} playerRank - The rank and high/pair values of the player hand.
   * @return {string} The winner of the tie breaker, or 'tie' if true tie
   */
  function breakTie(cpuRank, playerRank) {
    if (playerRank.top === cpuRank.top) {
      if (!playerRank.pair || (playerRank.pair === cpuRank.pair)) {
        return 'tie';
      } else if (playerRank.pair > cpuRank.pair) {
        return 'player';
      } else {
        return 'cpu';
      }
    } else if (playerRank.top > cpuRank.top) {
      return 'player';
    } else {
      return 'cpu';
    }
  }

  /**
   * This function checks for if the player has a straight, flush, royal flush, or straight
   * flush.
   * @param {object} hand - The hand being checked.
   * @return {object} The poker rank of the checked hand and the high card.
   */
  function checkStraightOrFlush(hand) {
    let hasStraight = checkStraight(hand);
    let hasFlush = checkFlush(hand);
    let hasStraightFlush = false;
    let hasRoyal = false;
    let top = getHighestCard(hand);
    let results = {top: top};
    if (hasFlush && hasStraight) {
      hasStraightFlush = true;
      hasRoyal = checkRoyal();
    }
    if (hasRoyal) {
      results.rank = 10;
    } else if (hasStraightFlush) {
      results.rank = 9;
    } else if (hasFlush) {
      results.rank = 6;
    } else if (hasStraight) {
      results.rank = 5;
    } else {
      results.rank = 0;
    }
    return results;
  }

  /**
   * This function checks whether the hand has a straight.
   * @param {object} hand - The player hand being checked.
   * @return {boolean} True if the hand has a straight.
   */
  function checkStraight(hand) {
    let sortedValues = getSortedNumFaceValues(hand);
    for (let i = 1; i < sortedValues.length; i++) {
      if ((sortedValues[i] - sortedValues[i-1]) !== 1) {
        return false;
      }
    }
    return true;
  }

  /**
   * This function checks whether the hand has a flush.
   * @param {object} hand - The player hand being checked.
   * @return {boolean} If the hand has a flush.
   */
  function checkFlush(hand) {
    let testSuit = hand[0].suit;
    return hand.every( card => {
      return card.suit === testSuit;
    });
  }

  /**
   * This function checks if the hand is a royal flush, it is only called if the player has a flush
   * and a straight.
   * @param {object} hand - The player hand being checked.
   * @return {boolean} If the hand has a royal flush.
   */
  function checkRoyal(hand) {
    let sortedValues = getSortedNumFaceValues(hand);
    for (let i = 8; i <+ 12; i++) {
      if (sortedValues[i] != i) {
        return false;
      }
    }
    return true;
  }

  /**
   * This function checks the possible multiples of cards that could be in the hand. It returns a
   * ranking based on the rank the hand would win.
   * @param {object} hand - The player hand being checked.
   * @return {object} Poker hand ranking of given cards and the card values of multiples found.
   */
  function checkMultiples(hand) {
    let cardCount = new Array(13).fill(0);
    hand.forEach( card => {
      let cardNum = Math.floor(card.num % 13);
      cardCount[cardNum]++;
    });
    let hasFour = false;
    let hasThree = false;
    let hasTwoPair = false;
    let hasPair = false;
    let results = {};
    let top, pair, single;
    cardCount.forEach( (value, i) => {
      if (value === 4) {
        hasFour = true;
        top = i;
      } else if (value === 3) {
        hasThree = true;
        top = i;
      } else if (value === 2 && hasPair) {
        hasTwoPair = true;
        top = i;
      } else if (value === 2) {
        hasPair = true;
        pair = i;
      } else if (value === 1) {
        single = i;
      }
    });
    if (top) {
      results.top = top;
      results.pair = pair;
    } else if (pair) {
      results.top = pair;
    } else {
      results.top = single;
    }
    if (hasFour) {
      results.rank = 8;
    } else if (hasThree && hasPair) {
      results.rank = 7;
    } else if (hasThree) {
      results.rank = 4;
    } else if (hasTwoPair) {
      results.rank = 3;
    } else if (hasPair) {
      results.rank = 2;
    } else {
      results.rank = 1;
    }
    return results;
  }

  // Helper function for translating card values, face values, suits, and getting the highest
  /**
   * Translate a number representing a card to its suit.
   * @param {number} cardNum - 0-51 definining the card in a standard deck as ordered above
   * @return {string} - The suit of the card
   */
  function getSuit(cardNum) {
    return SUITS[Math.floor(cardNum / 13)];
  }

  /**
   * Translate a number representing card to a face value.
   * @param {number} cardNum - 0-51 definining the card in a standard deck as ordered above
   * @return {string} - The value of the card
   */
  function getCardValue(cardNum) {
    return CARDS[cardNum % 13];
  }

  /**
   * Get the numerical value (0-12) which represents each face value on a card and sort it
   * @param {object} hand - The player hand being checked.
   * @return {array} Sorted numerical values for cards.
   */
  function getSortedNumFaceValues(hand) {
    let values = [];
    hand.forEach( card => {
      let numValue = Math.floor(card.num % 13);
      values.push(numValue);
    });
    // Use sort to put numbers in order
    values.sort( (a, b) => {
      return a-b;
    });
    return values;
  }

  /**
   * Function to find the highest numerical value card in a hand.
   * @param {object} hand
   * @return {number} 0-12 Number value of highest cards face value.
   */
  function getHighestCard(hand) {
    let highCard = 0;
    hand.forEach( card => {
      let cardVal = Math.floor(card.num % 13);
      highCard = Math.max(highCard, cardVal);
    });
    return highCard;
  }

  // JS Helper functions
  function gen(tagName) {
    return document.createElement(tagName);
  }

  function id(elId) {
    return document.getElementById(elId);
  }

  function qs(selector) {
    return document.querySelector(selector);
  }

  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();