import React, { useEffect, useState } from "react";
import './test.css';
function numberToLetter(num) {
    return String.fromCharCode(65 + num);
  }

function Test() {
    const [gameStarted, setGameStarted] = useState(false);
    const [story, setStory] = useState("");
    const [event, setEvent] = useState("");
    const [options, setOptions] = useState([]);
    const [isStoryVisible, setIsStoryVisible] = useState(true);
    const [gameCompleted, setGameCompleted] = useState(false); // To track game status
    const [gameEndStatus, setGameEndStatus] = useState("");
    const [multiplier, setMultiplier] = useState(0);
    const [event_no, setEvent_no] = useState(0);
    const startGame = async () => {
        try {
          const response = await fetch("http://127.0.0.1:8000/start_game/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
    
          const data = await response.json();
          setStory(data["story"]);
          setEvent(data["event"]);
          setOptions(data["options"]); // Assuming event.options contains the choices
          setEvent_no(Number(data["event_no"]));
          console.log("event no.",event_no);
        } catch (error) {
          console.error("Error starting the game:", error);
        }
      };
      const nextEvent = async (selectedOption) => {
        try {
          const response = await fetch("http://127.0.0.1:8000/next_event/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ choice : selectedOption }),
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
    
          const data = await response.json();
          console.log(data);
          if (data.game_completed) {
            // Handle game over or game completion scenario
            setGameCompleted(true);
            setMultiplier(data.multiplier);
            setGameEndStatus(data.game_end);
    
            if (data.game_end === "fail") {
              console.log("Game Over:", data.conclusion);
              setStory(data.conclusion); // Game over message
              setGameCompleted(true);
            } else if (data.game_end === "pass") {
              console.log("Game Completed:", data.conclusion);
              setStory(data.conclusion); // Game success message
              setGameCompleted(true);
            }
    
            setOptions([]); // Clear options
            setIsStoryVisible(true); // Show final story
            return;
          }
    
          // Update story and options for the next event if game is not over
          setStory(data.story);
          setEvent(data.event);
          setOptions(data.options);
          setEvent_no(data.event_no);
          setIsStoryVisible(true); // Show new story
        } catch (error) {
          console.error("Error progressing to next event:", error);
        }
      };
      const endGame = async () => {
        try {
          const response = await fetch("http://127.0.0.1:8000/end_game/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
    
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
    
          const data = await response.json();
          console.log(data); // Handle the response data as needed
        } catch (error) {
          console.error("Error ending the game:", error);
        }
      };
      useEffect(() => {
        const simulateGameLogic = async () => {
          if (gameStarted) return; // Prevent starting the game again
          setGameStarted(true);
          console.log("Starting game with wallet: local"); 
          await startGame();
        };
    
        simulateGameLogic();
    
        return () => {
     
        };
      }, [gameStarted]);


      const handleOptionSelect = (option,index) => {
        console.log("Selected option:", option);
        console.log("index",index);
        const updt_option = numberToLetter(index);
        nextEvent(updt_option); // Call next_event with the selected option
      };
      //this is reponsible to notify "game over" to withpayment
      const handleGameOver = (score, multiplier, status) => {
          endGame();
          setGameStarted(false);
          setGameCompleted(false);
          if (status === "close"){
            window.location.href = "/";
          }
          if (status === "rettry"){
            window.location.href = "/test";
          }
        
      };

    return (
        <div className="tosty">
            {isStoryVisible ? (
        <>
        <div className="story-container">
          <div className="pixel-box">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
            <div className="content">
            <p className="story-text">{story}</p>
            </div>
          </div>
        
        {gameCompleted ? (
        <div className="end-buttons">
          <button onClick={() => handleGameOver(event_no, multiplier, "retry")} className="replay-button">Replay</button>
          <button onClick={() => handleGameOver(event_no, multiplier, "close")} className="close-button">Close</button>
        </div>
      ) : (
        <div className="click-to-continue" onClick={() => setIsStoryVisible(false)}>
          <div className='continue'>Click to Continue!</div>
          <div className="triangle"></div>
        </div>
      )
      }
      </div>
      </>
      
      ) : (
        <div className="event-container">
          <div className="pixel-box">
            <div className="corner top-left"></div>
            <div className="corner top-right"></div>
            <div className="corner bottom-left"></div>
            <div className="corner bottom-right"></div>
            <div className="content">
            <div className="story-text">{event}</div>
            </div>
          </div>
          
          <div className="options-container">
            {options.map((option, index) => (
              <button key={index} className="option-button" onClick={() => handleOptionSelect(option,index)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={() => handleGameOver(10, 1, "close")}
        style={{ position: "absolute", top: "10px", left: "10px" }}
      >
        Trigger Game Over
      </button>
    </div>
      );
}

export default Test;
