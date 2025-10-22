import { LoadingScreen } from "@/components/ui/LoadingScreen";
import LexicalEditor from "./LexicalEditor";

/**
 * Rich Text Editor component with a clean API for lazy loading
 * Wraps the existing LexicalEditor with additional features and easier integration
 */
export const [loading, setLoading] = useState(true);
const RichTextEditor = forwardRef(
  (
    {
      value,
      onChange,
      placeholder = "Digite seu texto aqui...",
      className = "",
      readOnly = false,
      autoFocus = false,
      toolbar = true,
      minHeight = 200,
      maxHeight = 600,
      ...props
    },
    ref
  ) => {
    // Handle value changes from parent
    useEffect(() => {
      if (value !== undefined && value !== editorValue) {
        setEditorValue(value);
      }
    }, [value, editorValue]);

    const handleEditorChange = (editorState, editor) => {
      // Get plain text content for easier handling
      const textContent = editor.getEditorState().read(() => {
        const root = editor.getRootElement();
        return root?.textContent || "";
      });

      setEditorValue(textContent);

      // Call parent onChange if provided
      if (onChange) {
        onChange(textContent, editorState, editor);
      }
    };

    const editorConfig = {
      namespace: "RichTextEditor",
      theme: {
        text: {
          bold: "font-bold",
          italic: "italic",
          underline: "underline",
          strikethrough: "line-through",
        },
        link: "text-blue-500 hover:underline",
        heading: {
          h1: "text-3xl font-bold mb-4",
          h2: "text-2xl font-bold mb-3",
          h3: "text-xl font-bold mb-2",
        },
        paragraph: "mb-4",
        quote: "border-l-4 border-gray-300 pl-4 italic my-4",
        code: "bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-sm",
        list: {
          ul: "list-disc list-inside mb-4",
          ol: "list-decimal list-inside mb-4",
          listitem: "ml-4",
        },
      },
      onError(error) {
        console.error("RichTextEditor error:", error);
      },
    };

    /* if (loading) return <LoadingScreen />; */

    return (
      <div className={`rich-text-editor ${className}`} ref={ref} {...props}>
        <div
          className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${
            readOnly
              ? "bg-gray-50 dark:bg-gray-800"
              : "bg-white dark:bg-gray-900"
          }`}
          style={{
            minHeight: `${minHeight}px`,
            maxHeight: maxHeight ? `${maxHeight}px` : "none",
          }}
        >
          {toolbar && !readOnly && (
            <div className="border-b border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800">
              {/* Basic toolbar - can be extended */}
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  title="Negrito"
                  onClick={() => {
                    // Toolbar actions would be implemented here
                    // For now, this is a placeholder
                  }}
                >
                  <strong>B</strong>
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded italic"
                  title="Itálico"
                  onClick={() => {
                    // Toolbar actions would be implemented here
                  }}
                >
                  <em>I</em>
                </button>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded underline"
                  title="Sublinhado"
                  onClick={() => {
                    // Toolbar actions would be implemented here
                  }}
                >
                  <u>U</u>
                </button>
              </div>
            </div>
          )}

          <div className="p-4" style={{ minHeight: `${minHeight - 80}px` }}>
            <LexicalEditor
              config={editorConfig}
              value={editorValue}
              onChange={handleEditorChange}
              placeholder={placeholder}
              readOnly={readOnly}
              autoFocus={autoFocus}
            />
          </div>
        </div>

        {/* Character/word count */}
        {!readOnly && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
            {editorValue.length} caracteres
          </div>
        )}
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
