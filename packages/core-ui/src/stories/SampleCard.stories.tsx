import type { StoryDefault, Story } from "@ladle/react";
import { SampleCard } from "../components/SampleCard";
export const Default: Story = () => <SampleCard>Story renders</SampleCard>;
export default { title: "SampleCard" } satisfies StoryDefault;
