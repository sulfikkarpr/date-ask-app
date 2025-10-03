import React, { useEffect, useState, useRef } from "react";
import Confetti from "react-confetti";
import Calendar from "react-calendar";
import { motion, AnimatePresence } from "framer-motion";
import ConfettiExplosion from "react-dom-confetti";
import { Fireworks } from "fireworks-js";

export default function App() {
  const [step, setStep] = useState("ask");
  const [yesScale, setYesScale] = useState(1);
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const [pickedDate, setPickedDate] = useState(null);
  const [dateType, setDateType] = useState("Coffee");
  const [confirmed, setConfirmed] = useState(false);
  const [madeChoiceAt, setMadeChoiceAt] = useState(null);
  const [yesPop, setYesPop] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const yesRef = useRef(null);
  const fireworksRef = useRef(null);

  useEffect(() => {
    function onResize() {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("date-ask-response");
    if (saved) {
      try {
        const obj = JSON.parse(saved);
        if (obj.yes) {
          setStep("calendar");
          setPickedDate(obj.date ? new Date(obj.date) : null);
          setDateType(obj.type || "Coffee");
          setConfirmed(!!obj.confirmed);
          setMadeChoiceAt(obj.time);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    let fw;
    if (showFireworks && step === "celebrate" && fireworksRef.current) {
      fw = new Fireworks(fireworksRef.current, {
        rocketsPoint: { min: 50, max: 50 },
        hue: { min: 0, max: 360 },
        delay: { min: 15, max: 30 },
        speed: 2,
        acceleration: 1.05,
        friction: 0.95,
        gravity: 1.5,
        particles: 50,
        trace: 3,
        explosion: 5,
        autoresize: true,
        brightness: { min: 50, max: 80 },
        boundaries: { x: 50, y: 50, width: width - 100, height: height - 100 },
        sound: {
          enabled: false,
        },
      });
      fw.start();
      setTimeout(() => fw.stop(), 4000); // Stop after 4 seconds
    }
    return () => {
      if (fw) fw.stop();
    };
  }, [showFireworks, step, width, height]);

  const handleNo = () => {
    setYesScale((s) => Math.min(s + 0.35, 30));
  };

  const handleYes = () => {
    setYesPop(true);
    setShowFireworks(true);
    setMadeChoiceAt(new Date().toISOString());
    localStorage.setItem(
      "date-ask-response",
      JSON.stringify({ yes: true, time: new Date().toISOString() })
    );
    setStep("celebrate");
    setTimeout(() => {
      setShowFireworks(false);
      setStep("calendar");
    }, 5000); // 5 seconds instead of 3
  };

  const handleConfirm = () => {
    const payload = {
      yes: true,
      date: pickedDate ? pickedDate.toISOString() : null,
      type: dateType,
      confirmedAt: new Date().toISOString(),
    };
    localStorage.setItem("date-ask-response", JSON.stringify(payload));
    setConfirmed(true);
  };

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Fireworks canvas */}
      <div
        ref={fireworksRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: width,
          height: height,
          pointerEvents: "none",
          zIndex: 50,
        }}
      />

      {showFireworks && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={300}
          recycle={false}
        />
      )}

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-3xl transition-all duration-500">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-center">
            Will you go on a date with me?
          </h1>
          <p className="text-sm text-white/70 text-center">
            (no pressure — just vibes)
          </p>

          {step === "ask" && (
            <div
              className="flex items-center mt-6"
              style={{ gap: `${2 + yesScale * 2}rem` }}
            >
              <motion.button
                ref={yesRef}
                onClick={handleYes}
                animate={
                  yesPop
                    ? { scale: [1, 1.5, 0.9, 1.1, 1] }
                    : { scale: yesScale }
                }
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className="bg-pink-500 text-white font-bold px-6 py-3 rounded-full shadow-lg"
              >
                YES
                <ConfettiExplosion active={yesPop} />
              </motion.button>

              <button
                onClick={handleNo}
                className="bg-gray-300 text-gray-900 font-semibold px-6 py-3 rounded-full shadow-inner"
              >
                NO
              </button>
            </div>
          )}

          <AnimatePresence>
            {step === "celebrate" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 mt-6"
              >
                <div className="text-4xl">Yaaaaay! 🎉🌹</div>
                <div className="text-sm text-white/80">
                  Thanks — pick a date and we'll lock it in.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step === "calendar" && (
            <div className="w-full mt-4 flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-white/10 rounded-xl p-4 shadow-lg">
                <h3 className="font-semibold mb-2 text-pink-400">Choose a date</h3>
                <Calendar
                  onChange={setPickedDate}
                  value={pickedDate}
                  minDate={firstDay}
                  maxDate={lastDay}
                  defaultActiveStartDate={today}
                  prevLabel={null}
                  nextLabel={null}
                  navigationLabel={null}
                  showNeighboringMonth={false}
                  tileClassName={({ date, view }) =>
                    pickedDate && date.toDateString() === pickedDate.toDateString()
                      ? "bg-pink-500 text-white rounded-full"
                      : "hover:bg-pink-200 hover:text-pink-900 rounded-full"
                  }
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="bg-white/3 rounded-xl p-4">
                  <h3 className="font-semibold">Pick a date type</h3>
                  <select
                    value={dateType}
                    onChange={(e) => setDateType(e.target.value)}
                    className="mt-3 w-full bg-gray-800 text-white p-2 rounded-md"
                  >
                    <option>Coffee</option>
                    <option>Casual walk</option>
                    <option>Dinner</option>
                    <option>Movie</option>
                    <option>Silent</option>
                    <option>Karaoke</option>
                    <option>Street food crawl</option>
                  </select>
                </div>

                <div className="bg-white/3 rounded-xl p-4 flex flex-col gap-2">
                  <h3 className="font-semibold">Summary</h3>
                  <div className="text-sm text-white/80">
                    {pickedDate
                      ? pickedDate.toDateString()
                      : "No date selected"}
                  </div>
                  <div className="text-sm text-white/80">Type: {dateType}</div>

                  <button
                    onClick={handleConfirm}
                    disabled={!pickedDate || confirmed}
                    className="mt-3 bg-emerald-500 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-md"
                  >
                    Confirm
                  </button>

                  {confirmed && (
                    <div className="mt-2 text-sm text-white/90">
                      Date confirmed — check localStorage or your app's backend
                      for details.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {confirmed && (
            <div className="mt-6 text-center">
              <div className="font-semibold">
                All set! I'll notify you (stored in browser)
              </div>
              <div className="text-xs text-white/70 mt-1">
                You can replace localStorage with a remote endpoint to receive
                updates.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
