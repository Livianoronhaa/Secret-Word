//hooks
import { useCallback, useEffect, useState } from 'react';

//CSS
import './App.css';

//lista de palavras
import { wordsList } from './data/words';

//componentes
import StartScreen from './components/StartScreen';
import Game from './components/Game';
import GameOver from './components/GameOver';

import sucessSound from './assets/sucess.mp3';
import incorrectSound from './assets/error.mp3';
import initialSound from './assets/initial.mp3';
import incorrect from './assets/incorrect.mp3';
import correct from './assets/correct.mp3';

// Define os estágios do jogo
const stages = [
  { id: 1, name: 'start' },
  { id: 2, name: 'game' },
  { id: 3, name: 'end' },
];

// Define a quantidade de tentativas
const guessesQty = 5;

function App() {
  // Define os estados iniciais
  const [gameStage, setGameStage] = useState(stages[0].name);
  const [words] = useState(wordsList);

  const [pickedWord, setPickedWord] = useState('');
  const [pickedCategory, setPickedCategory] = useState('');
  const [letters, setLetters] = useState([]);

  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [guesses, setGuesses] = useState(guessesQty); // Tentativas
  const [score, setScore] = useState(0);

  // Função para remover acentos de uma letra
  const normalizeLetter = (letter) => {
    return letter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  // Função que seleciona uma palavra e uma categoria aleatoriamente
  const pickedWordAndCategory = useCallback(() => {
    // Seleciona a categoria
    const categories = Object.keys(words);
    const category =
      categories[Math.floor(Math.random() * Object.keys(categories).length)];

    console.log(category);

    // Seleciona a palavra da categoria
    const word =
      words[category][Math.floor(Math.random() * words[category].length)];

    console.log(word);

    return { word, category };
  }, [words]);

  // Função que inicia o jogo
  const startGame = useCallback(() => {
    // Limpa os estados das letras
    clearLetterStages();
    const { word, category } = pickedWordAndCategory();

    // Cria um array de letras
    let wordLetters = word
      .split('')
      .map((l) => normalizeLetter(l.toLowerCase()));

    // Deixa todas as letras minúsculas
    wordLetters = wordLetters.map((l) => l.toLowerCase());

    console.log(word, category);
    console.log(wordLetters);

    // Reseta o jogo
    setPickedWord(word);
    setPickedCategory(category);
    setLetters(wordLetters);

    // Muda o estágio do jogo para 'game'
    setGameStage(stages[1].name);
  }, [pickedWordAndCategory]);

  // Função que verifica se a letra está correta
  const verifyLetter = (letter) => {
    const normalizedLetter = letter.toLowerCase();

    // Checa se a letra já foi usada
    if (
      guessedLetters.includes(normalizedLetter) ||
      wrongLetters.includes(normalizedLetter)
    ) {
      return;
    }

    // Adiciona a letra às letras adivinhadas ou às letras erradas
    if (letters.includes(normalizedLetter)) {
      setGuessedLetters((actualGuessedLetters) => [
        ...actualGuessedLetters,
        letter,
      ]);
      const audio = new Audio(correct);
      audio.play();
    } else {
      setWrongLetters((actualWrongLetters) => [
        ...actualWrongLetters,
        normalizedLetter,
      ]);
      const audio = new Audio(incorrect);
      audio.play();

      // Decrementa as tentativas
      setGuesses((actualGuesses) => actualGuesses - 1);
    }
  };

  // Função que limpa os estados das letras
  const clearLetterStages = () => {
    setGuessedLetters([]);
    setWrongLetters([]);
  };

  // Condição de derrota
  useEffect(() => {
    if (guesses <= 0) {
      // Muda o estado para 'end' quando acabam as tentativas
      setGameStage(stages[2].name);
      clearLetterStages();

      const audio = new Audio(incorrectSound);
      audio.play();
    }
  }, [guesses]);

  // Condição de vitória
  useEffect(() => {
    const uniqueLetters = [...new Set(letters)];

    if (
      guessedLetters.length === uniqueLetters.length &&
      gameStage === stages[1].name
    ) {
      // Incrementa a pontuação
      setScore((actualScore) => (actualScore += 100));

      const audio = new Audio(sucessSound);
      audio.play();
      // Inicia um novo jogo
      startGame();
    }
  }, [guessedLetters, letters, gameStage, startGame]);

  // Função para reiniciar o jogo
  const retry = () => {
    setScore(0);
    setGuesses(guessesQty);

    // Muda o estado para 'start'
    setGameStage(stages[0].name);

    const audio = new Audio(initialSound);
    audio.play();
  };

  return (
    <div className="App">
      {/* Renderiza os componentes com base no estágio do jogo */}
      {gameStage === 'start' && <StartScreen startGame={startGame} />}
      {gameStage === 'game' && (
        <Game
          verifyLetter={verifyLetter}
          pickedWord={pickedWord}
          pickedCategory={pickedCategory}
          letters={letters}
          guessedLetters={guessedLetters}
          wrongLetters={wrongLetters}
          guesses={guesses}
          score={score}
        />
      )}
      {gameStage === 'end' && <GameOver retry={retry} score={score} />}
    </div>
  );
}

export default App;
