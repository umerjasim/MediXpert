import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

const App: React.FC<{
    darkMode: boolean
}> = ({ darkMode }) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const getRandomColor = (isDarkMode: boolean) => {
    const letters = isDarkMode ? "89ABCDEF" : "01234567";
    return `#${Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * letters.length)]).join("")}`;
  };
  
  const getRandomColorsArray = (count: number, isDarkMode: boolean) => {
    return Array.from({ length: count }, () => getRandomColor(isDarkMode));
  };

  const availableShapes = ["circle", "square", "triangle", "star", "polygon", "line", "edge"];
  const availableInteractivityModes = ["bubble", "repulse", "slow", "trail", "push", "remove", "grab"];

  const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const getRandomFloat = (min: number, max: number) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(1));
  };

  const options: ISourceOptions = useMemo(() => {
    const particleColors = getRandomColorsArray(10, darkMode);
    const linkColors = getRandomColorsArray(10, darkMode);
    const shapes = Array.from({ length: 4 }, () => getRandomItem(availableShapes)); // Multiple random shapes
    const interactivityMode = getRandomItem(availableInteractivityModes);

    return {
      background: {
        color: {
          value: darkMode ? "#1d2e3e" : "#e6f4ff",
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: interactivityMode,
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 50,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: particleColors,
        },
        links: {
          color: linkColors,
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        move: {
          direction: MoveDirection.none,
          enable: true,
          outModes: {
            default: OutMode.out,
          },
          random: false,
          speed: Math.random() * 5 + 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: Math.floor(Math.random() * (200 - 100) + 100),
        },
        opacity: {
          value: getRandomFloat(0.3, 0.7),
        },
        shape: {
          type: shapes,
        },
        size: {
          value: getRandomFloat(2, 7),
        },
      },
      detectRetina: true,
    };
  }, [darkMode]);

  if (init) {
    return (
      <Particles
        key={darkMode ? "dark" : "light"}
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
      />
    );
  }

  return <></>;
};

export default App;