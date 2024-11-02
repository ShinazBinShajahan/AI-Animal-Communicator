"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, MessageCircle, Zap, Volume2 } from "lucide-react";

type Animal =
  | "cat"
  | "dog"
  | "mouse"
  | "bear"
  | "lion"
  | "elephant"
  | "monkey"
  | "owl";

const animals: {
  type: Animal;
  emoji: string;
  sounds: string[];
  pitch: number;
  rate: number;
}[] = [
  {
    type: "cat",
    emoji: "🐱",
    sounds: ["meow", "meoow", "mew", "purr", "hiss", "meowwww"],
    pitch: 1.5,
    rate: 1.3,
  },
  {
    type: "dog",
    emoji: "🐶",
    sounds: ["woof", "bark", "arf", "growl", "howl", "bow bow", "bau bauuuu"],
    pitch: 0.8,
    rate: 1.4,
  },
  {
    type: "mouse",
    emoji: "🐭",
    sounds: ["squeak", "eek", "peep", "queek"],
    pitch: 2,
    rate: 1.8,
  },
  {
    type: "bear",
    emoji: "🐻",
    sounds: ["growl", "roar", "aargh", "grr"],
    pitch: 0.5,
    rate: 1.2,
  },
  {
    type: "lion",
    emoji: "🦁",
    sounds: ["roar", "growl", "roarrr", "rorr", "aaarrghh", "ghraa"],
    pitch: 0.6,
    rate: 1.3,
  },
  {
    type: "elephant",
    emoji: "🐘",
    sounds: ["mmwwwaaaaaaa", "mmmmmm", "ghaaaa", "mghaaa"],
    pitch: 0.4,
    rate: 1.1,
  },
  {
    type: "monkey",
    emoji: "🐵",
    sounds: ["ooh ooh", "eee eee", "chatter", "screech", "huhu"],
    pitch: 1.2,
    rate: 1.6,
  },
  {
    type: "owl",
    emoji: "🦉",
    sounds: ["hoot", "hoo", "screech", "whoop", "swooosh"],
    pitch: 1.3,
    rate: 1.2,
  },
];

function generateRealisticSound(animal: Animal): string {
  const animalSounds = animals.find((a) => a.type === animal)?.sounds || [];
  let response = "";
  const isLongResponse = Math.random() > 0.4;
  const responseLength = isLongResponse
    ? Math.floor(Math.random() * 6) + 4
    : Math.floor(Math.random() * 3) + 2;

  for (let i = 0; i < responseLength; i++) {
    const sound = animalSounds[Math.floor(Math.random() * animalSounds.length)];
    const pitch =
      Math.random() > 0.5 ? sound.toUpperCase() : sound.toLowerCase();
    const length = Math.random() > 0.8 ? sound.repeat(2) : sound;
    const emphasis = Math.random() > 0.9 ? `${length}!` : length;
    response += (response ? " " : "") + emphasis;
  }

  return response;
}

type Message = {
  id: string;
  sender: "user" | "animal";
  content: string;
};

function useTTS() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (
    text: string,
    options: {
      pitch?: number;
      rate?: number;
      volume?: number;
      voice?: SpeechSynthesisVoice;
    } = {}
  ) => {
    if (!isSupported) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.pitch = options.pitch ?? 1;
    utterance.rate = options.rate ?? 1;
    utterance.volume = options.volume ?? 1;

    if (options.voice) {
      utterance.voice = options.voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return {
    speak,
    stop,
    voices,
    isSupported,
    isSpeaking,
  };
}

export default function Home() {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isChangeAnimalOpen, setIsChangeAnimalOpen] = useState(false);
  const tts = useTTS();

  const handleAnimalSelect = (animal: Animal) => {
    setSelectedAnimal(animal);
    const initialMessage = `Greetings! I'm an AI-powered ${animal}. How may I assist you today?`;
    setMessages([
      { id: Date.now().toString(), sender: "animal", content: initialMessage },
    ]);
    setIsChangeAnimalOpen(false);
  };

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    const newMessages = [
      ...messages,
      { id: Date.now().toString(), sender: "user", content: input },
    ];
    setMessages(newMessages);
    setInput("");

    setTimeout(() => {
      if (selectedAnimal) {
        const response = generateRealisticSound(selectedAnimal);
        setMessages([
          ...newMessages,
          { id: Date.now().toString(), sender: "animal", content: response },
        ]);
      }
    }, 300);
  };

  const handleSpeakMessage = (message: Message) => {
    if (selectedAnimal) {
      const animalVoice = animals.find((a) => a.type === selectedAnimal);
      if (animalVoice) {
        if (tts.isSpeaking) {
          tts.stop();
          return;
        }

        const voice = tts.voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (selectedAnimal === "mouse" || selectedAnimal === "cat"
              ? v.name.includes("Female")
              : v.name.includes("Male"))
        );

        tts.speak(message.content, {
          pitch: animalVoice.pitch,
          rate: animalVoice.rate,
          voice: voice,
        });
      }
    }
  };

  const AnimalSelectionContent = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {animals.map((animal) => (
        <Button
          key={animal.type}
          onClick={() => handleAnimalSelect(animal.type)}
          className="h-24 text-lg p-2 flex flex-col items-center justify-center bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
          variant="outline"
        >
          <span className="text-4xl mb-2">{animal.emoji}</span>
          <span className="capitalize text-sm">{animal.type}</span>
        </Button>
      ))}
    </div>
  );

  if (!selectedAnimal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <Card className="w-full max-w-4xl bg-white bg-opacity-90 shadow-xl rounded-xl overflow-hidden relative z-10">
          <CardContent className="p-6">
            <h1 className="text-4xl font-bold text-center mb-6 text-green-800">
              AI Animal Communicator
            </h1>
            <p className="text-center text-green-700 mb-8 text-lg">
              Embark on a journey of interspecies communication with our
              cutting-edge AI technology.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center text-center bg-green-100 p-4 rounded-lg">
                <Brain className="w-12 h-12 text-green-600 mb-2" />
                <h3 className="font-semibold mb-1 text-green-800">
                  Advanced AI
                </h3>
                <p className="text-sm text-green-700">
                  Powered by state-of-the-art language models
                </p>
              </div>
              <div className="flex flex-col items-center text-center bg-green-100 p-4 rounded-lg">
                <MessageCircle className="w-12 h-12 text-green-600 mb-2" />
                <h3 className="font-semibold mb-1 text-green-800">
                  Natural Conversations
                </h3>
                <p className="text-sm text-green-700">
                  Engage in lifelike dialogues with various animals
                </p>
              </div>
              <div className="flex flex-col items-center text-center bg-green-100 p-4 rounded-lg">
                <Zap className="w-12 h-12 text-green-600 mb-2" />
                <h3 className="font-semibold mb-1 text-green-800">
                  Instant Responses
                </h3>
                <p className="text-sm text-green-700">
                  Get immediate, context-aware animal communications
                </p>
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-4 text-center text-green-800">
              Select Your Animal Companion
            </h2>
            <AnimalSelectionContent />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-green-50">
      <header className="bg-green-800 text-white shadow-md p-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">
            AI Animal Communicator [AnimalGPT]
          </h1>
          <Dialog
            open={isChangeAnimalOpen}
            onOpenChange={setIsChangeAnimalOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="text-black border-white hover:bg-green-700"
              >
                Change Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Choose a new animal companion</DialogTitle>
              </DialogHeader>
              <AnimalSelectionContent />
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm mt-2 text-green-200 max-w-4xl mx-auto">
          Currently communicating with: {selectedAnimal}{" "}
          {animals.find((a) => a.type === selectedAnimal)?.emoji}
        </p>
      </header>
      <ScrollArea className="flex-grow p-4 max-w-4xl mx-auto w-full">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.sender === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800 border border-gray-300"
              }`}
            >
              {message.content}
            </div>
            <div className="mt-1">
              <Button
                variant="ghost"
                size="sm"
                className={`text-green-600 hover:text-green-800 ${
                  tts.isSpeaking ? "bg-green-100" : ""
                }`}
                onClick={() => handleSpeakMessage(message)}
                disabled={!tts.isSupported}
              >
                <Volume2
                  className={`h-4 w-4 mr-1 ${
                    tts.isSpeaking ? "animate-pulse" : ""
                  }`}
                />
                {tts.isSpeaking ? "Stop" : "Speak"}
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 bg-green-100 border-t border-green-200">
        <div className="flex space-x-2 max-w-4xl mx-auto">
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-grow bg-white"
          />
          <Button
            onClick={handleSendMessage}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
