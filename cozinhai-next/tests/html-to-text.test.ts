import { describe, expect, it } from "vitest";
import { htmlToText } from "@/utils/html-to-text";

describe("htmlToText", () => {
  it("preserva texto e separação de parágrafos sem markup executável", () => {
    expect(
      htmlToText(
        "<p>Misture &amp; mexa</p><script>alert('teste')</script><p>Sirva</p>",
      ),
    ).toBe("Misture & mexa\nSirva");
  });
});
