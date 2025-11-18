import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Select from "react-select";
import { RiAiGenerate2 } from "react-icons/ri";
import { VscVscodeInsiders } from "react-icons/vsc";
import Editor from "@monaco-editor/react";
import { FaCopy, FaFileExport } from "react-icons/fa";
import { ImNewTab } from "react-icons/im";
import { IoMdClose } from "react-icons/io";
import { GoogleGenAI } from "@google/genai";
import { RingLoader } from "react-spinners";
import { toast } from "react-toastify";

const Home = () => {
  const options = [
    { value: "html-css", label: "HTML + CSS" },
    { value: "html-tailwind", label: "HTML + Tailwind CSS" },
    { value: "html-bootstrap", label: "HTML + Bootstrap" },
    { value: "html-css-js", label: "HTML + CSS + JS" },
    { value: "html-tailwind-bootstrap", label: "HTML + Tailwind + Bootstrap" },
  ];

  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [frameWork, setFrameWork] = useState(options[0]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewtabOpen, setIsNewtabOpen] = useState(false);

  // Extract clean code
  function extractCode(response) {
    const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : response.trim();
  }

  // AI setup
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyAA6QB9_TwWaRrHjWsicL5fDLq4-y4IGbw",
  });

  // Generate code
  async function getResponse() {
    if (!prompt.trim()) return toast.error("Please describe your component!");
    setLoading(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
        You are an experienced programmer with expertise in modern web design.
        Generate a UI component for: ${prompt}
        Framework: ${frameWork.value}

        Requirements:
        - Clean, responsive, modern UI.
        - Include subtle animations, hover effects, and good typography.
        - Output ONLY code in one HTML file.
      `,
      });
      const finalCode = extractCode(response.text);
      setCode(finalCode);
      setOutputScreen(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate code");
    } finally {
      setLoading(false);
    }
  }

  // Copy code
  const copyCode = async () => {
    if (!code.trim()) return toast.error("Nothing to copy!");
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied successfully!");
    } catch {
      toast.error("Failed to copy code!");
    }
  };

  // Download code
  const downloadFile = () => {
    if (!code.trim()) return toast.error("No code to download");
    const fileName = "GeneratedUI.html";
    const blob = new Blob([code], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success("File downloaded");
  };

  // Open in new tab
  const openInNewTab = () => {
    const newWindow = window.open();
    newWindow.document.write(code);
    newWindow.document.close();
  };

  return (
    <>
      <Navbar />

      <div className="flex items-start px-[100px] justify-between gap-[30px] py-10 transition-all duration-300">
        {/* LEFT PANEL */}
        <div className="left w-[50%] bg-[#141319]/90 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-[#222] transition-all duration-300 hover:shadow-xl">
          <h3 className="text-[22px] font-semibold text-white">
            AI Code Generator
          </h3>
          <p className="mt-2 text-gray-400 text-sm">
            Describe your component and let AI build it for you.
          </p>

          <label className="block text-sm font-bold mt-5 text-gray-300">
            Framework
          </label>
          <Select
            className="mt-2 text-sm"
            options={options}
            defaultValue={frameWork}
            onChange={(e) => setFrameWork(e)}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#1e1e1e",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: "10px",
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: "#1e1e1e",
                color: "#fff",
              }),
              singleValue: (base) => ({ ...base, color: "#fff" }),
            }}
          />

          <label className="block text-sm font-bold mt-5 text-gray-300">
            Describe your component
          </label>
          <textarea
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            autoFocus
            placeholder="e.g., A responsive login form with gradient background and hover effects..."
            className="w-full min-h-[180px] mt-2 rounded-xl bg-[#09090b] text-white text-sm p-4 resize-none border border-[#2a2a2a] focus:border-purple-600 outline-none transition-all"
          />

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Click on the generate button to generate your code.
            </p>
            <button
              disabled={loading}
              onClick={getResponse}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white font-semibold transition-all ${
                loading
                  ? "bg-purple-800 opacity-70 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90"
              }`}
            >
              {loading ? (
                <RingLoader color="white" size={18} />
              ) : (
                <RiAiGenerate2 size={20} />
              )}
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right relative w-[50%] h-[80vh] bg-[#141319]/90 backdrop-blur-md rounded-2xl border border-[#222] shadow-lg overflow-hidden">
          {!outputScreen ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fadeIn">
              <div className="p-6 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full text-3xl text-white">
                <VscVscodeInsiders />
              </div>
              <p className="mt-3 text-sm text-gray-400">
                Your generated code will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex items-center justify-between px-6 bg-[#17171c] h-[50px] border-b border-[#222]">
                <div className="flex gap-3">
                  <button
                    onClick={() => setTab(1)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      tab === 1
                        ? "bg-[#333] text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Code
                  </button>
                  <button
                    onClick={() => setTab(2)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      tab === 2
                        ? "bg-[#333] text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Preview
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  {tab === 1 ? (
                    <>
                      <button
                        onClick={copyCode}
                        className="w-[38px] h-[38px] flex items-center justify-center rounded-lg border border-[#333] hover:bg-[#2a2a2a] transition-all"
                      >
                        <FaCopy />
                      </button>
                      <button
                        onClick={downloadFile}
                        className="w-[38px] h-[38px] flex items-center justify-center rounded-lg border border-[#333] hover:bg-[#2a2a2a] transition-all"
                      >
                        <FaFileExport />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={openInNewTab}
                      className="w-[38px] h-[38px] flex items-center justify-center rounded-lg border border-[#333] hover:bg-[#2a2a2a] transition-all"
                    >
                      <ImNewTab />
                    </button>
                  )}
                </div>
              </div>

              {/* Editor / Preview */}
              <div className="h-[calc(100%-50px)] animate-fadeIn">
                {tab === 1 ? (
                  <Editor
                    value={code}
                    height="100%"
                    theme="vs-dark"
                    language="html"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      smoothScrolling: true,
                    }}
                  />
                ) : (
                  <iframe
                    srcDoc={code}
                    className="w-full h-full border-0 bg-[#1a1a1a] transition-all duration-300"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODAL PREVIEW */}
      {isNewtabOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
          <div className="relative w-[90%] h-[90%] bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-300">
            <button
              onClick={() => setIsNewtabOpen(false)}
              className="absolute top-3 right-3 w-[35px] h-[35px] flex items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-all"
            >
              <IoMdClose />
            </button>
            <iframe srcDoc={code} className="w-full h-full border-0"></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
