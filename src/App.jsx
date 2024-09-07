import { useState, useEffect } from 'react';
import playButton from './assets/button.png'
import './App.css';
import axios from 'axios';
import Swal from 'sweetalert2'

const Alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
const Hangman = [
  {
    state: 0, drawing: [
      "  ____    ",
      "  |       ",
      "  |       ",
      "  |       ",
      "  |       ",
      "  |       ",
      "__|___    "]
  },
  {
    state: 1, drawing: [
      "  ____    ",
      "  |  |    ",
      "  |       ",
      "  |       ",
      "  |       ",
      "  |       ",
      "__|___    "]
  },
  {
    state: 2, drawing: [
      "  ____    ",
      "  |  |    ",
      "  |  O    ",
      "  |       ",
      "  |       ",
      "  |       ",
      "__|___    "]
  },
  {
    state: 3, drawing: [
      "  ____    ",
      "  |  |    ",
      "  |  O    ",
      "  | /|\\   ",
      "  |       ",
      "  |       ",
      "__|___    "]
  },
  {
    state: 4, drawing: [
      "  ____    ",
      "  |  |    ",
      "  |  O    ",
      "  | /|\\   ",
      "  |  |    ",
      "  |       ",
      "__|___    "]
  },
  {
    state: 5, drawing: [
      "  ____    ",
      "  |  |    ",
      "  |  O    ",
      "  | /|\\   ",
      "  |  |    ",
      "  | / \\   ",
      "__|___    "]
  },
];

function App() {
  const [count, setCount] = useState(0);
  const [guess, setGuess] = useState("");
  const [guessLetters, setGuessLetters] = useState([]);
  const [visible, setVisible] = useState(false);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [clickedIndex, setClickedIndex] = useState([]);
  const [clickedLetters, setClickedLetters] = useState([]);
  const [lettersChoice, setLettersChoice] = useState([])

  const nextState = () => {
    setCount((prevCount) => (prevCount + 1) % Hangman.length);
  };


  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  }

  const generateLetters = () => {
    const lettersToGuess = guess.split("")
    const filtered = Alphabet.filter((letter) => !lettersToGuess.includes(letter));
    // you can adjust the number of letters choices to increase the difficulty
    const selected = filtered.slice(0, 8);
    let newAlphabet = [...lettersToGuess, ...selected];
    newAlphabet = shuffleArray(newAlphabet);
    return newAlphabet;
  }

  const randomNumberInRange = (min, max) => {
    return Math.floor(Math.random()
      * (max - min + 1)) + min;
  };
  const handleStartClick = () => {
    // you can adjust the word to guess length to increase the difficulty here
    const number = randomNumberInRange(3, 6)
    axios.get(`https://random-word-api.herokuapp.com/word?length=${number}`)
      .then(res => {
        setGuess(res.data[0].toUpperCase())
      }).catch(err => {
        console.log(err)
      })
    setCount(0);
    setClickedLetters([]);
    setClickedIndex([]);
    setCorrectLetters(new Array(guess.length).fill("_"));
    setVisible(true);
  };

  useEffect(() => {
    if (guess) {
      setGuessLetters(guess.split(""));
      setCorrectLetters(new Array(guess.length).fill("_"));
      setLettersChoice(generateLetters());
    }
  }, [guess]);

  const handleLetterClick = (letter, index) => {
    setClickedIndex((prev) => [...prev, index]);
    setClickedLetters((prev) => [...prev, letter]);
    checkCorrectLetter(letter)
  };

  const handleWinLose = (win, word) => {
    const title = win ? "Yay!!" : "Ops...";
    const icon = win ? "success" : "error";
    const message = win ? `You Won! The word is: ${word}` : `You Lost! The word is: ${word}`;

    Swal.fire({
      icon: icon,
      title: title,
      text: message,
      confirmButtonText: "Replay",
      cancelButtonText: "Exit",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        handleStartClick();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        setVisible(false)
      }
    });
  };

  useEffect(() => {
    if (count == 5) {
      handleWinLose(false, guess)
    }
  }, [count]);


  const checkCorrectLetter = (letter) => {
    const newGuessLetters = [...guessLetters];
    const newCorrectLetters = [...correctLetters];

    if (guessLetters.includes(letter)) {
      const index = guessLetters.indexOf(letter);
      newGuessLetters[index] = '_'
      newCorrectLetters[index] = letter
      setGuessLetters(newGuessLetters)
      setCorrectLetters(newCorrectLetters)

      if (!newCorrectLetters.includes("_")) {
        handleWinLose(true, guess)
      }

    } else {
      nextState()
    }

  };

  // debuging here
  // console.log("letters Choice:", lettersChoice);
  // console.log("guess:", guess);
  // console.log("clicked letters: ", clickedLetters);
  // console.log("correct letters: ", correctLetters);
  // console.log("guess Letters: ", guessLetters);

  return (
    <div className='w-screen h-screen flex justify-center items-center'>

      <div className='flex flex-col justify-center items-center w-full h-full'>
        {/* starting screen */}

        {!visible &&
          <div className='flex flex-col items-center'>
            <h1 className='font-doodle cursor-pointer text-8xl pt-10'>Hangman</h1>
            <img className='cursor-pointer h-60 w-60' src={playButton} onClick={handleStartClick} />

          </div>}

        {visible && (
          <>
            {/* Hangman Drawing */}

            <pre className='p-5 text-center'>
              {Hangman[count].drawing.join("\n")}
            </pre>

            <p className='text-center text-xl font-normal'>Guess the word!</p>

            {/* Guessing the word */}
            <div className='grid grid-flow-col m-10 gap-2'>
              {correctLetters.map((letter, i) => (
                <div key={i} className='h-8 w-8 bg-stone-950 flex justify-center items-center rounded'>
                  <p>{letter}</p>
                </div>
              ))}
            </div>

            {/* Letters to pick from */}

            <div className='grid grid-rows-2 grid-flow-col gap-4'>
              {lettersChoice.map((letter, index) => (
                <div
                  key={index}
                  onClick={clickedIndex.includes(index) ? undefined : () => handleLetterClick(letter, index)}
                  className={`h-8 w-8 flex justify-center items-center rounded  ${clickedIndex.includes(index) ? 'bg-transparent' : 'bg-stone-950 cursor-pointer'
                    }`}
                >
                  {!clickedIndex.includes(index) ? letter : null}
                </div>
              ))}
            </div>


          </>
        )}
      </div>
    </div>
  );
}

export default App;