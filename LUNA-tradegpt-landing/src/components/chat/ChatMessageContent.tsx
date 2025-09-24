/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/chat/ChatMessageContent.tsx

import { useState, useMemo, memo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { ChevronDown, ChevronUp, Copy, Check, Download, ExternalLink, Share2, ZoomIn, ZoomOut, RotateCw, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { toast } from "../ui/use-toast";
import {
  isImageUrl,
  getDirectImageUrl,
  sanitizeMarkdownImages,
} from "../../utils/imageUtils";
import { Dialog, DialogContent } from "../ui/dialog";
import React from "react";

interface ChatMessageContentProps {
  content: string;
  isAgent: boolean;
  stream: boolean;
  timestamp?: string;
  images?: string[];
  onSavePlan?: () => void; // Thêm prop callback
}

const STREAMING_SPEED = 3; // Giảm xuống 3ms để mượt hơn

// --- CÁC COMPONENT PHỤ (KHÔNG THAY ĐỔI) ---
const CopyButton = ({
  elementRef,
}: {
  elementRef: React.RefObject<HTMLElement>;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = elementRef.current?.innerText;

    if (!textToCopy) {
      toast({
        title: "Lỗi!",
        description: "Không có nội dung để sao chép.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        toast({
          title: "Đã sao chép!",
          description: "Nội dung đã được sao chép vào clipboard.",
          duration: 2000,
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Không thể sao chép", err);
        toast({
          title: "Lỗi sao chép!",
          description: "Không thể sao chép nội dung. Vui lòng thử lại.",
          variant: "destructive",
          duration: 2000,
        });
      });
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className={`absolute top-1 right-1 h-8 w-8
              border transition-colors
              dark:text-white/70 dark:hover:bg-white/20 dark:border-transparent
              text-slate-700 hover:bg-slate-100 border-slate-200`}
            aria-label="Sao chép"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Đã sao chép" : "Sao chép"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CodeBlockRenderer = ({
  node,
  children,
  onSave,
  saved,
  showSave,
  ...props
}: any) => {
  const preRef = useRef<HTMLPreElement>(null);
  return (
    <div
      className={cn(
        "relative my-2 group border overflow-x-auto",
        "bg-slate-900/80 border border-slate-700/60",
        "rounded-xl shadow-lg"
      )}
    >
      <ActionButtons
        elementRef={preRef}
        onSave={onSave}
        saved={saved}
        showSave={showSave}
      />
      <pre
        ref={preRef}
        className={cn(
          "p-4 text-sm font-mono text-slate-100 bg-transparent rounded-xl whitespace-pre-wrap break-all transition-colors duration-200",
          "scrollbar-thin scrollbar-thumb-violet-400/40 scrollbar-track-transparent"
        )}
        style={{
          fontFamily: "JetBrains Mono, Fira Mono, Menlo, monospace",
          minHeight: 48,
        }}
        {...props}
      >
        {children}
      </pre>
      <style>{`
        .group:hover pre {
          background: linear-gradient(90deg, #1e293b 0%, #334155 100%);
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
};

const ActionButtons = ({
  elementRef,
  onSave,
  saved,
  showSave = false,
}: {
  elementRef: React.RefObject<HTMLElement>;
  onSave?: () => void;
  saved?: boolean;
  showSave?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = elementRef.current?.innerText;

    if (!textToCopy) {
      toast({
        title: "Lỗi!",
        description: "Không có nội dung để sao chép.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopied(true);
        toast({
          title: "Đã sao chép!",
          description: "Nội dung đã được sao chép vào clipboard.",
          duration: 2000,
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Không thể sao chép", err);
        toast({
          title: "Lỗi sao chép!",
          description: "Không thể sao chép nội dung. Vui lòng thử lại.",
          variant: "destructive",
          duration: 2000,
        });
      });
  };

  return (
    <div className="absolute top-2 right-2 flex items-center gap-1">
      {showSave && (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSave}
                disabled={saved}
                className={cn(
                  "h-7 w-7 border transition-colors rounded-md",
                  "text-slate-300 hover:bg-slate-700/50 border-slate-600"
                )}
              >
                {saved ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-base">+</span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{saved ? "Đã lưu" : "Lưu nội dung"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className={cn(
                "h-7 w-7 border transition-colors rounded-md",
                "text-slate-300 hover:bg-slate-700/50 border-slate-600"
              )}
              aria-label="Sao chép"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? "Đã sao chép" : "Sao chép"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const TableRenderer = ({ node, onSave, saved, showSave, ...props }: any) => {
  const tableRef = useRef<HTMLTableElement>(null);
  return (
    <div className="relative my-4 group">
      <ActionButtons
        elementRef={tableRef}
        onSave={onSave}
        saved={saved}
        showSave={showSave}
      />
      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          className="w-full border-collapse text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          {...props}
        />
      </div>
    </div>
  );
};

const isVideoUrl = (url: string) => {
  if (!url || typeof url !== 'string') return false;
  return /^https?:\/\/.*\.(mp4|webm|ogg)(\?.*)?$/i.test(url.trim());
};

// Hàm đệ quy hiển thị JSON dạng bảng lồng bảng
function renderJsonAsTable(data: any): JSX.Element {
  if (Array.isArray(data)) {
    if (data.length === 0)
      return <span className="italic text-muted-foreground">[]</span>;
    return (
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="border border-violet-400/30 dark:border-blue-400/20 rounded-lg p-2 bg-background/60"
          >
            <div className="text-xs text-muted-foreground mb-1">#{idx + 1}</div>
            {typeof item === "object" && item !== null ? (
              renderJsonAsTable(item)
            ) : (
              <span>{String(item)}</span>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data);
    if (entries.length === 0)
      return (
        <span className="italic text-muted-foreground">
          Không có dữ liệu để hiển thị
        </span>
      );
    return (
      <table className="min-w-[220px] w-full border border-slate-300 dark:border-blue-400/40 rounded-xl bg-white dark:bg-gradient-to-br dark:from-[#18181b] dark:via-[#23272f] dark:to-[#18181b] text-sm mb-2">
        <tbody>
          {entries.map(([key, value]) => (
            <tr
              key={key}
              className="border-b last:border-b-0 border-slate-200 dark:border-border hover:bg-violet-100/40 dark:hover:bg-blue-900/10 transition-colors align-top"
            >
              <td className="font-semibold px-4 py-2 text-violet-700 dark:text-blue-400 whitespace-nowrap w-1/4 align-top">
                {key}
              </td>
              <td className="px-4 py-2 text-slate-800 dark:text-foreground align-top">
                {typeof value === "object" && value !== null ? (
                  renderJsonAsTable(value)
                ) : (
                  <span className="whitespace-pre-wrap">{String(value)}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  // primitive
  return <span>{String(data)}</span>;
}

// --- COMPONENT CHÍNH ĐÃ ĐƯỢC SỬA LỖI ---
export const ChatMessageContent = memo(
  ({
    content,
    isAgent,
    stream,
    timestamp,
    images,
    onSavePlan,
  }: ChatMessageContentProps) => {
    // FIX: State `animatedContent` chỉ dùng cho hiệu ứng animation.
    // Nếu không stream, nó sẽ bằng `content` ngay lập tức.
    const [animatedContent, setAnimatedContent] = useState(() =>
      stream && isAgent ? "" : content
    );

    // Tối ưu hóa useEffect để tránh lag
    useEffect(() => {
      // Nếu không phải tin nhắn agent cần stream, hiển thị toàn bộ nội dung và dừng.
      if (!isAgent || !stream) {
        setAnimatedContent(content);
        return;
      }

      // Nếu nội dung đã hiển thị xong, không cần làm gì thêm.
      if (animatedContent === content) {
        return;
      }

      setAnimatedContent(""); // Reset khi có content mới đến
      let currentLength = 0;
      
      // Sử dụng requestAnimationFrame để mượt hơn
      const animate = () => {
        currentLength += 2; // Tăng 2 ký tự mỗi frame để nhanh hơn
        const newContent = (content && typeof content === 'string') ? content.substring(0, currentLength) : '';
        setAnimatedContent(newContent);

        if (currentLength < (content && typeof content === 'string' ? content.length : 0)) {
          requestAnimationFrame(animate);
        }
      };

      // Bắt đầu animation với delay nhỏ
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 10);

      // Hàm dọn dẹp
      return () => {
        clearTimeout(timeoutId);
      };
    }, [content, isAgent, stream]); // Bỏ animatedContent dependency để tránh re-render

    // --- Logic thu gọn/mở rộng cho tin nhắn user (không đổi) ---
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongMessage = useMemo(() => {
      if (isAgent) return false;
      const lineCount = (content && typeof content === 'string' ? (content.match(/\n/g) || []).length : 0) + 1;
      return lineCount > 5 || (content && typeof content === 'string' ? content.length : 0) > 500;
    }, [content, isAgent]);

    const handleToggleExpand = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    };

    const commonMarkdownProps = {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeRaw],
      components: {
        p: ({ node, ...props }: any) => (
          <p className="mb-2 last:mb-0" {...props} />
        ),
        pre: CodeBlockRenderer,
        code: ({ node, ...props }: any) => (
          <code
            className="bg-black/20 text-red-400 rounded px-1 py-0.5 mx-0.5"
            {...props}
          />
        ),
        a: ({ node, ...props }: any) => (
          <a
            className="text-blue-500 hover:underline break-all"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        ul: ({ node, ...props }: any) => (
          <ul
            className="list-disc list-outside pl-5 my-2 space-y-1"
            {...props}
          />
        ),
        ol: ({ node, ...props }: any) => (
          <ol
            className="list-decimal list-outside pl-5 my-2 space-y-1"
            {...props}
          />
        ),
        li: ({ node, ...props }: any) => (
          <li className="pl-1 [&>p:first-of-type]:inline" {...props} />
        ),
        table: TableRenderer,
        thead: ({ node, ...props }: any) => (
          <thead className="bg-slate-100 dark:bg-slate-800" {...props} />
        ),
        th: ({ node, ...props }: any) => (
          <th
            className="border border-slate-300 dark:border-slate-600 font-semibold p-2 text-left whitespace-nowrap"
            {...props}
          />
        ),
        td: ({ node, ...props }: any) => (
          <td
            className="border border-slate-300 dark:border-slate-700 p-2 whitespace-nowrap"
            {...props}
          />
        ),
      },
    };

    // --- FIX: Logic render nội dung được tối ưu ---
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageZoom, setImageZoom] = useState(1);
    const [imageRotation, setImageRotation] = useState(0);

    const renderContent = () => {
      // Nếu có images là mảng, render tất cả ảnh phía trên nội dung
      if (images && Array.isArray(images) && images.length > 0) {
        if (images.length === 1) {
          // 1 ảnh: giữ layout cũ, thêm onClick
          return (
            <div className="space-y-2 mb-2">
              <img
                src={images[0]}
                alt="img-0"
                className="max-w-xs rounded shadow mx-auto my-2 cursor-pointer hover:opacity-80 transition"
                style={{ maxHeight: 180 }}
                onClick={() => setPreviewImage(images[0])}
              />
              {renderContentOrigin()}
            </div>
          );
        }
        // Nhiều ảnh: xếp hàng ngang, ảnh nhỏ lại
        return (
          <div className="space-y-2 mb-2">
            <div className="flex flex-row gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`img-${idx}`}
                  className="w-24 h-24 object-cover rounded shadow flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                  onClick={() => setPreviewImage(img)}
                />
              ))}
            </div>
            {renderContentOrigin()}
          </div>
        );
      }
      return renderContentOrigin();
    };
    // Hàm gốc để render nội dung chat như cũ
    const renderContentOrigin = () => {
      // 1. Kiểm tra Video và Ảnh
      const contentLines = (content && typeof content === 'string' ? content.trim().split("\n") : []);
      const isPotentiallyVideo = contentLines.some((line) => isVideoUrl(line));
      const isPotentiallyImage = contentLines.some((line) => {
        // Kiểm tra cả link thuần và markdown link
        return (
          (line && typeof line === 'string' && line
            .match(/https?:\/\/[^\s)]+/gi)
            ?.some((url) => isImageUrl(getDirectImageUrl(url)))) || false
        );
      });

      // --- XỬ LÝ: Chuyển đổi mọi loại link ảnh thành markdown ảnh để hiển thị trực tiếp ---
      let processedContent = animatedContent;
      if (isAgent) {
        processedContent = sanitizeMarkdownImages(processedContent);
      }

      if (isAgent && (isPotentiallyVideo || isPotentiallyImage)) {
        const animatedLines = (processedContent && typeof processedContent === 'string' ? processedContent.split("\n") : []);
        return (
          <div className="space-y-2">
            {animatedLines.map((line, idx) => {
              const originalLine = contentLines[idx] || "";
              // Kiểm tra video
              if (isVideoUrl(originalLine)) {
                return (
                  <video
                    key={idx}
                    src={(line && typeof line === 'string') ? line.trim() : ''}
                    controls
                    className="max-w-xs rounded shadow mx-auto my-2"
                    style={{ maxHeight: 320 }}
                  />
                );
              }
              // Kiểm tra ảnh (cả link thuần và markdown)
              const urls = (originalLine && typeof originalLine === 'string') ? originalLine.match(/https?:\/\/[^\s)]+/gi) || [] : [];
              const imageUrl = urls.find((url) =>
  isImageUrl(getDirectImageUrl(url))
);
if (imageUrl) {
  return (
    <img
      key={idx}
      src={getDirectImageUrl(imageUrl)}
      alt="Ảnh sản phẩm"
      className="max-w-xs rounded shadow mx-auto my-2 cursor-pointer hover:opacity-80 transition"
      style={{ maxHeight: 320 }}
      onClick={() => setPreviewImage(getDirectImageUrl(imageUrl))}
      onError={(e) => {
        console.warn("Không thể tải ảnh:", imageUrl);
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
// Render markdown cho các dòng khác
return (
  <ReactMarkdown key={idx} {...commonMarkdownProps}>
    {line}
  </ReactMarkdown>
);
            })}
          </div>
        );
      }

      // 2. Kiểm tra JSON
      let parsedJson = null;
      try {
        // Chỉ thử parse khi không còn stream để đảm bảo chuỗi JSON hoàn chỉnh
        if (!stream) {
          parsedJson = JSON.parse(content);
        }
      } catch (e) {
        /* Không phải JSON, bỏ qua */
      }

      if (
        isAgent &&
        parsedJson &&
        typeof parsedJson === "object" &&
        parsedJson !== null
      ) {
        // Nếu là JSON, hiển thị bảng lồng bảng cho mọi object/array
        if (stream) {
          return <p>...</p>;
        }
        return (
          <div className="overflow-x-auto my-2 whitespace-pre-wrap">
            {renderJsonAsTable(parsedJson)}
          </div>
        );
      }

      // 3. Mặc định render Markdown
      if (isAgent) {
        // Luôn dùng animatedContent để có hiệu ứng typing
        return (
          <ReactMarkdown {...commonMarkdownProps}>
            {processedContent}
          </ReactMarkdown>
        );
      }

      // 4. Tin nhắn của User (logic mặc định)
      const userContent =
        isLongMessage && !isExpanded
          ? (content && typeof content === 'string' ? content.split("\n").slice(0, 5).join("\n") + "\n..." : content)
          : content;
      return <p className="whitespace-pre-wrap">{userContent}</p>;
    };

    const containerClassName = cn(
      "w-full",
      isAgent
        ? "text-black dark:text-slate-100"
        : "text-black dark:text-slate-100",
      // Remove all card-like backgrounds, borders, shadows, rounded, etc.
      isAgent ? "bg-transparent" : "bg-transparent"
    );

    const ToggleButton = ({ isExpanded }: { isExpanded: boolean }) => (
      <div className="absolute -top-2 -right-2 z-10">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleExpand}
                className="h-8 w-8  bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
                aria-label={isExpanded ? "Thu gọn văn bản" : "Mở rộng văn bản"}
              >
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" align="center">
              {isExpanded ? "Thu gọn văn bản" : "Mở rộng văn bản"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );

    const [saved, setSaved] = useState(false);
    const [showSaveButton, setShowSaveButton] = useState(false);

    const handleSave = async () => {
      if (onSavePlan) {
        await onSavePlan();
        setSaved(true);
        // Ẩn nút sau khi lưu thành công
        setTimeout(() => {
          setShowSaveButton(false);
        }, 2000);
      }
    };

    // Kiểm tra xem nội dung có phải là đặc biệt không (cần lưu)
    const isSpecialContent = (content: string): boolean => {
      if (!content || typeof content !== 'string') return false;
      
      // Kiểm tra các ký tự đặc biệt của markdown
      const hasMarkdownSyntax =
        /(?:^|\n)(?:#{1,6} |---|\*\*|==|>|\d+\. |\* |- |\[ \]|\|[-|]|```)/.test(
          content
        );

      if (hasMarkdownSyntax) return true;

      // Kiểm tra có code block không
      if (content.includes("```")) return true;

      // Kiểm tra có bảng Markdown không
      if (content.includes("|") && content.includes("|-")) return true;

      // Kiểm tra có multiple newlines để phân đoạn không
      if (/\n\n/.test(content)) return true;

      return false;
    };

    // Hiện nút save khi hover vào message
    const handleMouseEnter = () => {
      if (isAgent && onSavePlan && !saved && isSpecialContent(content)) {
        setShowSaveButton(true);
      }
    };

    const handleMouseLeave = () => {
      // Chỉ ẩn nút nếu chưa lưu
      if (!saved) {
        setShowSaveButton(false);
      }
    };

    // Helper functions for image actions
    const handleDownloadImage = async () => {
      if (!previewImage) return;
      
      try {
        const response = await fetch(previewImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `image-${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Tải xuống thành công!",
          description: "Ảnh đã được tải về máy của bạn.",
          duration: 2000,
        });
      } catch (error) {
        toast({
          title: "Lỗi tải xuống!",
          description: "Không thể tải xuống ảnh. Vui lòng thử lại.",
          variant: "destructive",
          duration: 2000,
        });
      }
    };

    const handleCopyImageLink = async () => {
      if (!previewImage) return;
      
      try {
        await navigator.clipboard.writeText(previewImage);
        toast({
          title: "Đã sao chép!",
          description: "Liên kết ảnh đã được sao chép vào clipboard.",
          duration: 2000,
        });
      } catch (error) {
        toast({
          title: "Lỗi sao chép!",
          description: "Không thể sao chép liên kết. Vui lòng thử lại.",
          variant: "destructive",
          duration: 2000,
        });
      }
    };

    const handleShareImage = async () => {
      if (!previewImage) return;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Chia sẻ ảnh',
            url: previewImage,
          });
        } catch (error) {
          // Fallback to copy link if share fails
          handleCopyImageLink();
        }
      } else {
        // Fallback to copy link if Web Share API is not supported
        handleCopyImageLink();
      }
    };

    const handleOpenInNewTab = () => {
      if (!previewImage) return;
      window.open(previewImage, '_blank');
    };

    const handleZoomIn = () => {
      setImageZoom(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
      setImageZoom(prev => Math.max(prev - 0.25, 0.25));
    };

    const handleRotate = () => {
      setImageRotation(prev => (prev + 90) % 360);
    };

    const handleResetImage = () => {
      setImageZoom(1);
      setImageRotation(0);
    };

    const handleCloseModal = () => {
      setPreviewImage(null);
      setImageZoom(1);
      setImageRotation(0);
    };

    return (
  <>
    {/* Enhanced Modal xem ảnh lớn */}
    <Dialog open={!!previewImage} onOpenChange={(open) => !open && handleCloseModal()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur-sm border border-border/50">
        {previewImage && (
          <div className="relative w-full h-full flex flex-col">
            {/* Header với các action buttons */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-background/90 to-transparent p-3 border-b border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-foreground font-medium">Xem ảnh</h3>
                  <div className="text-muted-foreground text-sm">
                    Zoom: {Math.round(imageZoom * 100)}%
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleDownloadImage}
                          className="text-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Tải xuống</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopyImageLink}
                          className="text-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Sao chép liên kết</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleShareImage}
                          className="text-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Chia sẻ</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleOpenInNewTab}
                          className="text-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Mở trong tab mới</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div className="w-px h-6 bg-border mx-1" />

                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleZoomIn}
                          disabled={imageZoom >= 3}
                          className="text-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8 disabled:opacity-50"
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Phóng to</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleZoomOut}
                          disabled={imageZoom <= 0.25}
                          className="text-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8 disabled:opacity-50"
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Thu nhỏ</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRotate}
                          className="text-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Xoay ảnh</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div className="w-px h-6 bg-border mx-1" />

                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCloseModal}
                          className="text-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Đóng</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Image container */}
            <div className="flex-1 flex items-center justify-center p-4 pt-16 overflow-hidden">
              <div className="relative max-w-[500px] max-h-[500px] overflow-hidden">
                <img
                  src={previewImage}
                  alt="Ảnh xem lớn"
                  className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out rounded-lg shadow-lg"
                  style={{ 
                    transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                  onDoubleClick={handleResetImage}
                />
              </div>
            

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3 border-t border-border/30">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handleResetImage}
                  className="text-foreground hover:bg-accent hover:text-accent-foreground text-sm"
                  disabled={imageZoom === 1 && imageRotation === 0}
                >
                  Đặt lại
                </Button>
                <div className="text-muted-foreground text-sm">
                  Nhấp đúp để đặt lại • Cuộn để zoom
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    <div
      className="relative pt-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={cn(containerClassName, "pr-2 pb-1")}>
          {renderContent()}
          {/* Floating Action Button để lưu */}
          {isAgent && onSavePlan && isSpecialContent(content) && (
            <div
              className={cn(
                "absolute top-0 right-0 transition-all duration-200 ease-in-out transform",
                showSaveButton || saved
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none"
              )}
            >
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant={saved ? "ghost" : "default"}
                      onClick={handleSave}
                      disabled={saved}
                      className={cn(
                        "h-8 w-8 rounded-full shadow-lg",
                        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
                        "dark:from-purple-600 dark:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700",
                        "transition-all duration-200",
                        saved && "bg-none bg-green-500 hover:bg-green-600"
                      )}
                    >
                      {saved ? (
                        <Check className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-white text-lg">+</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    className="bg-slate-900 text-white"
                  >
                    <p>{saved ? "Đã lưu thành công" : "Lưu nội dung này"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        {/* Timestamp và Toggle Button không thay đổi */}
        {isLongMessage && <ToggleButton isExpanded={isExpanded} />}
      </div>
      </>
    );
  }
);

// Loại bỏ timestamp khỏi đây, vì nó sẽ được render riêng bên ngoài
// để không bị ảnh hưởng bởi logic re-render của content
