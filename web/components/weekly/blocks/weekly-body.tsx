import { parseBody } from "@/lib/weekly/blocks";
import {
  ColumnsBlockView,
  ImageBlockView,
  ImageTextBlockView,
  RichTextBlockView,
} from "./block-renderers";

/**
 * Renders a Weekly Riwayat article body. Parses the stored block document
 * (legacy Markdown bodies degrade to a single rich-text block) and lays each
 * block out in order. The drop-cap is applied to the first rich-text block
 * only, matching the previous single-body reading view.
 */
export function WeeklyBody({ body }: { body: string }) {
  const { blocks } = parseBody(body);
  let firstRichTextSeen = false;

  return (
    <div className="space-y-10 sm:space-y-12">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "richtext": {
            const dropCap = !firstRichTextSeen;
            firstRichTextSeen = true;
            return <RichTextBlockView key={i} block={block} dropCap={dropCap} />;
          }
          case "columns":
            return <ColumnsBlockView key={i} block={block} />;
          case "image":
            return <ImageBlockView key={i} block={block} />;
          case "imageText":
            return <ImageTextBlockView key={i} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
