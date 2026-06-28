import React from 'react';

const Loader = () => {
  return (
    <>
      <style>{`
        .custom-loader-wrapper {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-family: "Inter", sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: white;
          border-radius: 9999px;
          background-color: transparent;
          user-select: none;
          overflow: hidden;
        }

        .custom-loader {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background-color: transparent;
          animation: custom-loader-shadow 2s linear infinite;
          z-index: 0;
        }

        @keyframes custom-loader-shadow {
          0% {
            box-shadow:
              0 2px 4px 0 #fff inset,
              0 4px 8px 0 #ad5fff inset,
              0 12px 16px 0 #471eec inset;
          }
          25% {
            box-shadow:
              2px 0 4px 0 #fff inset,
              4px 0 8px 0 #ad5fff inset,
              12px 0 16px 0 #471eec inset;
          }
          50% {
            box-shadow:
              0 -2px 4px 0 #fff inset,
              0 -4px 4px 0 #d60a47 inset,
              0 -8px 16px 0 #311e80 inset;
          }
          75% {
            box-shadow:
              -2px 0 4px 0 #fff inset,
              -4px 0 4px 0 #d60a47 inset,
              -8px 0 16px 0 #311e80 inset;
          }
          100% {
            box-shadow:
              0 2px 4px 0 #fff inset,
              0 4px 8px 0 #ad5fff inset,
              0 12px 16px 0 #471eec inset;
          }
        }

        .custom-loader-letter {
          display: inline-block;
          opacity: 0.4;
          transform: translateY(0);
          animation: custom-loader-letter-anim 2s infinite;
          z-index: 1;
          border-radius: 50ch;
          border: none;
        }

        .custom-loader-letter:nth-child(1) { animation-delay: 0s; }
        .custom-loader-letter:nth-child(2) { animation-delay: 0.1s; }
        .custom-loader-letter:nth-child(3) { animation-delay: 0.2s; }
        .custom-loader-letter:nth-child(4) { animation-delay: 0.3s; }
        .custom-loader-letter:nth-child(5) { animation-delay: 0.4s; }
        .custom-loader-letter:nth-child(6) { animation-delay: 0.5s; }
        .custom-loader-letter:nth-child(7) { animation-delay: 0.6s; }
        .custom-loader-letter:nth-child(8) { animation-delay: 0.7s; }
        .custom-loader-letter:nth-child(9) { animation-delay: 0.8s; }
        .custom-loader-letter:nth-child(10) { animation-delay: 0.9s; }

        @keyframes custom-loader-letter-anim {
          0%, 100% {
            opacity: 0.4;
            transform: translateY(0);
          }
          20% {
            opacity: 1;
            transform: scale(1.15);
          }
          40% {
            opacity: 0.7;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="custom-loader-wrapper">
        <span className="custom-loader-letter">G</span>
        <span className="custom-loader-letter">e</span>
        <span className="custom-loader-letter">n</span>
        <span className="custom-loader-letter">e</span>
        <span className="custom-loader-letter">r</span>
        <span className="custom-loader-letter">a</span>
        <span className="custom-loader-letter">t</span>
        <span className="custom-loader-letter">i</span>
        <span className="custom-loader-letter">n</span>
        <span className="custom-loader-letter">g</span>
        <div className="custom-loader" />
      </div>
    </>
  );
};

export default Loader;
