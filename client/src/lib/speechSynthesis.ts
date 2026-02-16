export function speak(text: string, onEnd?: () => void) {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ru-RU";
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const russianVoice = voices.find(
    (v) => v.lang.startsWith("ru") && v.name.toLowerCase().includes("female")
  ) || voices.find((v) => v.lang.startsWith("ru"));

  if (russianVoice) {
    utterance.voice = russianVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
