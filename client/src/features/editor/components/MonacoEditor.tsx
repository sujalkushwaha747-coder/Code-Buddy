import Editor from "@monaco-editor/react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  language: string;
};

const MonacoEditor = ({ value, onChange, language }: Props) => {
  return (
    <Editor
      height="500px"
      language={language}
      value={value}
      onChange={(val) => onChange(val || "")}
      theme="vs-dark"
    />
  );
};

export default MonacoEditor;
