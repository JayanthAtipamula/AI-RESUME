import React from 'react';
import styled from 'styled-components';

interface GenerateButtonProps {
  onClick: () => void;
  isGenerating: boolean;
  type: 'resume' | 'cover-letter';
}

const GenerateButton = ({ onClick, isGenerating, type }: GenerateButtonProps) => {
  return (
    <StyledWrapper>
      <button className="btn" onClick={onClick} disabled={isGenerating}>
        <svg height={24} width={24} fill="#00ffff" viewBox="0 0 24 24" data-name="Layer 1" id="Layer_1" className="sparkle">
          <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z" />
        </svg>
        <span className="text">
          {isGenerating ? 'Generating...' : `Generate ${type === 'resume' ? 'Resume' : 'Cover Letter'}`}
        </span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: relative;
  width: fit-content;

  .btn {
    border: 1px solid rgba(0, 255, 255, 0.3);
    width: 15em;
    height: 3.5em;
    border-radius: 0.5em;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    background: rgba(0, 255, 255, 0.05);
    cursor: pointer;
    transition: all 450ms ease-in-out;
    position: relative;
    overflow: hidden;
  }

  .btn::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      transparent 40%,
      rgba(0, 255, 255, 0.1),
      rgba(0, 255, 255, 0.1) 50%,
      transparent 60%,
      transparent
    );
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
    animation: shine 3s infinite;
  }

  .btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(0, 255, 255, 0.05),
      rgba(0, 255, 255, 0.1),
      rgba(0, 255, 255, 0.05),
      transparent
    );
    animation: innerShine 4s ease-in-out infinite;
  }

  @keyframes shine {
    0% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    80% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    100% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
  }

  @keyframes innerShine {
    0% {
      left: -100%;
    }
    20% {
      left: -100%;
    }
    60% {
      left: 100%;
    }
    100% {
      left: 100%;
    }
  }

  .sparkle {
    fill: #00ffff;
    transition: all 800ms ease;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 0 2px #00ffff);
  }

  .text {
    font-weight: 600;
    color: #00ffff;
    font-size: 0.9rem;
    white-space: nowrap;
    position: relative;
    z-index: 1;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
  }

  .btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: rgba(0, 255, 255, 0.05);
  }

  .btn:disabled .text {
    color: #AAAAAA;
    text-shadow: none;
  }

  .btn:disabled .sparkle {
    fill: #AAAAAA;
    filter: none;
  }

  .btn:not(:disabled):hover {
    background: rgba(0, 255, 255, 0.1);
    border-color: rgba(0, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
  }

  .btn:not(:disabled):hover .text {
    color: #00ffff;
    text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
  }

  .btn:not(:disabled):hover .sparkle {
    fill: #00ffff;
    transform: scale(1.2);
    filter: drop-shadow(0 0 4px #00ffff);
  }
`;

export default GenerateButton;
