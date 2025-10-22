import { LoadingScreen } from "@/components/ui/LoadingScreen";

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Start typing...",
  className = "",
  readOnly = false,
  style = {},
  ...props
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  if (readOnly) {
    /* if (loading) return <LoadingScreen />; */

    return (
      <div
        className={`border rounded-md p-3 min-h-[200px] bg-gray-50 ${className}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: value }}
        {...props}
      />
    );
  }

  /* if (loading) return <LoadingScreen />; */

  return (
    <div
      className={`border rounded-md ${isFocused ? "border-blue-500" : "border-gray-300"} ${className}`}
      style={style}
    >
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex gap-1 bg-gray-50">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
          title="Underline"
        >
          <u>U</u>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => execCommand("justifyLeft")}
          className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
          title="Align Left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyCenter")}
          className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => execCommand("justifyRight")}
          className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100"
          title="Align Right"
        >
          →
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="p-3 min-h-[200px] focus:outline-none"
        style={{ minHeight: style.minHeight || "200px" }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        {...props}
      />
    </div>
  );
};

export default RichTextEditor;
