import { PaletteProvider, ThemePalette } from "@palettebro/theme-toolbar";
import { Heading } from "~/components/ui/heading";
import { HeadingWrapper } from "~/components/ui/heading";
import { useTheme } from "~/hooks/use-theme";
import { themes } from "~/themes";

export default function Screen() {
  const theme = useTheme();
  return (
    <PaletteProvider lightOrDark={theme} themes={themes}>
      <HeadingWrapper>
        <Heading>Palette</Heading>
      </HeadingWrapper>
      <ThemePalette />
    </PaletteProvider>
  );
}
