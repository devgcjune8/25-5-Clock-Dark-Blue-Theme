// Accurate_Interval.js
// Thanks Squeege! For the elegant answer provided to this question:
// http://stackoverflow.com/questions/8173580/setinterval-timing-slowly-drifts-away-from-staying-accurate
// Github: https://gist.github.com/Squeegy/1d99b3cd81d610ac7351
// Slightly modified to accept 'normal' interval/timeout format (func, time).

const accInterval = function (fn, time) {
    let cancel, nextAt, timeout, wrapper;
    nextAt = new Date().getTime() + time;
    timeout = null;
    wrapper = function () {
        nextAt += time;
        timeout = setTimeout(wrapper, nextAt - new Date().getTime());
        return fn();
    };
    cancel = function () {
        return clearTimeout(timeout);
    };
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return {
        cancel: cancel
    };
};

const Main = () => {
    return (
    <div id='root'>
        <Clock />
        <footer>The audio clip is property of <a href="http://www.soundjay.com/" target="_blank">soundjay.com</a>. Feel free to visit their website to look audio clips for your presentations or whatnot.</footer>
    </div>
    )
}

function Clock() {
    const DEFAULT_BREAK_MINS = 5;
    const DEFAULT_SESSION_MINS = 25;

    const [breakMinutes, setBreakMinutes] = React.useState(DEFAULT_BREAK_MINS);
    const [sessionMinutes, setSessionMinutes] = React.useState(DEFAULT_SESSION_MINS);
    
    const [activeMode, setActiveMode] = React.useState("default")

    const [reset, setReset] = React.useState(0);

    const [start, setStart] = React.useState(false);

    return (

    <div className = "clock-container">
        <div className="title">
            <h1>25 + 5 Clock</h1>
            <h2>(Pomodoro Clock)</h2>
        </div>
        <div id = "ticker-container">
            <div className = "ticker-title">Tickers</div>
                <div className = "tickers down-and-up">
                <Setters 
                    unclickable={start}
                    type="break" 
                    labeltitle="Break Time" 
                    minutes={breakMinutes} 
                    ticker={setBreakMinutes}
                    />
                <Setters 
                    unclickable={start}
                    type="session" 
                    labeltitle="Session Time" 
                    minutes={sessionMinutes} 
                    ticker={setSessionMinutes}
                    />
            </div>
        </div>
        <TimerDisplay {...{start, reset, activeMode, setActiveMode, breakMinutes,sessionMinutes}}/>
        <Buttons {...{setStart, onReset: handleReset }}/>
    </div>
    );

    function handleReset() {
        setBreakMinutes(DEFAULT_BREAK_MINS);
        setSessionMinutes(DEFAULT_SESSION_MINS);
        setActiveMode("default");
        setReset(reset + 1);
        setStart(false);
    }
} 

const Setters = ({type, labeltitle, minutes, ticker, unclickable}) =>
{
   const labeltitleID = type + "-label";
   const incID = type + "-increment";
   const decID = type + "-decrement";
   const minID = type + "-length";

   return (<div className="minute-ticker">
    <div id={labeltitleID} 
         className="labeltitle">
            {labeltitle}
        </div>
        <button id={decID} onClick={decrement}>
        <span class="material-icons-outlined">
        remove_circle_outline
</span>
        </button>
        <span className="min-tick"id={minID}>{minutes}</span>
        <button id={incID} onClick={increment}>
        <span class="material-icons-outlined">
add_circle_outline
</span>
        </button>
   </div>
);


function decrement() {
    if (unclickable) {
        return;
    }

    if (minutes > 1) {
        ticker(minutes - 1);
    }
}

function increment() {
    if (unclickable) {
        return;
    }

    if (minutes < 60) {
        ticker(minutes + 1);
    }
}
}


const TimerDisplay = ({ start, reset, activeMode, setActiveMode, sessionMinutes, breakMinutes 
}) => {
    const audioBeep = React.useRef();

    const [time, setTime] = React.useState(
        (activeMode === "default" ? sessionMinutes : breakMinutes) * 60);


    React.useEffect(() => {
        if (start) {
            const interval = accInterval(countDown, 1000);

            return function cleanup() {
                interval.cancel();
            };
        }
    }, [start]);

    React.useEffect(() => {
        setTime(sessionMinutes * 60);
    }, [sessionMinutes]);

    React.useEffect(() => {
        setTime((activeMode === "default" ? sessionMinutes : breakMinutes) * 60);
    }, [activeMode]);

    React.useEffect(() => {
        const audioEffect = audioBeep.current;
        audioEffect.pause();
        audioEffect.currentTime = 0;
    }, [reset]);


    return (
        <div className="time-display">
            <div id="timer-label">
                {activeMode === "default" ? "Session" : "Break"}
                </div>
                <div id="time-left" 
                className="time-left">{minAndSecDisplay()}
                </div>
                <audio 
                    id="beep"
                    src="https://www.soundjay.com/phone/phone-off-hook-1.wav"
                    preload="auto"
                    ref={audioBeep} />
        </div>

    );

    function countDown() {
        setTime((prevTime) => {
            if (prevTime > 0) {
                return prevTime - 1;
            } else if (prevTime === 0) {
                setActiveMode(mode => mode === "default" ? "break" : "default");
                const audioEffect = audioBeep.current;
                audioEffect.currentTime = 0;
                audioEffect.play();
                return prevTime;
            } else {
                throw Error(`Timer ${prevTime}`);
            }
        });
    }

    function minAndSecDisplay() {
        const SEC_TO_MIN = 60;
        let min = Math.floor(time / SEC_TO_MIN);
        let sec = time - min * SEC_TO_MIN;

        min = (min < 10 ? "0" : "") + min;
        sec = (sec < 10 ? "0" : "") + sec;
        return min + ":" + sec;

    }
}

const Buttons = ({setStart, onReset}) => {
    return (
    <div className="tickers controller">
        <button className="start-stop control" id="start_stop" onClick={handlePausing}>
            Start / Stop
        </button>
        <button className="reset control" id="reset" onClick={onReset}>
            Reset
        </button>
    </div>
    )

    function handlePausing() {
       setStart((start) => !start)
    }

}


ReactDOM.render(<Main />,document.querySelector('#app'))