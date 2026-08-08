import { Component, ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  children: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

/** Isolates a render-time crash to one card/widget instead of taking down the whole screen. */
export class WidgetBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[WidgetBoundary]", this.props.label, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="bg-surface border border-white/10 rounded-xl p-4">
          <Text className="text-white/50">
            {this.props.label ?? "This section"} couldn&apos;t load.
          </Text>
          <Pressable
            onPress={() => this.setState({ hasError: false })}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            className="mt-2"
          >
            <Text className="text-brand text-xs font-bold uppercase">Retry</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
