import { Fragment } from "react";

import { parseBody } from "@/lib/weekly/blocks";
import { AdSlot } from "@/components/ads/ad-slot";
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

  // Inject the in-line ad after this block index — mid-article, but only when
  // the article is long enough that it isn't effectively "after the body".
  const inlineAdAfter = blocks.length >= 4 ? 1 : -1;

  return (
    <div className="space-y-10 sm:space-y-12">
      {blocks.map((block, i) => {
        let rendered: React.ReactNode;
        switch (block.type) {
          case "richtext": {
            const dropCap = !firstRichTextSeen;
            firstRichTextSeen = true;
            rendered = <RichTextBlockView block={block} dropCap={dropCap} />;
            break;
          }
          case "columns":
            rendered = <ColumnsBlockView block={block} />;
            break;
          case "image":
            rendered = <ImageBlockView block={block} />;
            break;
          case "imageText":
            rendered = <ImageTextBlockView block={block} />;
            break;
          default:
            rendered = null;
        }
        return (
          <Fragment key={i}>
            {rendered}
            {i === inlineAdAfter && <AdSlot placement="weekly-inline" />}
          </Fragment>
        );
      })}
    </div>
  );
}
