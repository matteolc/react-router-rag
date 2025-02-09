import { ThemePalette } from "@palettebro/theme-toolbar";
import { Heading } from "~/components/ui/heading";
import { HeadingWrapper } from "~/components/ui/heading";

export default function Screen() {
  return (
    <>
      <HeadingWrapper>
        <Heading>Palette</Heading>
      </HeadingWrapper>
      <ThemePalette />
    </>
  );
}
