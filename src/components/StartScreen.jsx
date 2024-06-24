import './StartScreen.css';
import logo from '../assets/logo.svg'

const StartScreen = ({startGame}) => {
  return <div className='start'>
    <img src={logo} alt="" />
    <button onClick={startGame}>Começar o jogo!</button>
  </div>;
};

export default StartScreen;
