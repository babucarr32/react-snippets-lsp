import { buildTag } from "./utils";

// Test function - remove after debugging
const testBuildTag = () => {
  const testCases = ['View', 'View:', 'View:style', 'TouchableOpacity:onPress(handlePress)'];
  testCases.forEach(test => {
    console.log(`Input: "${test}" -> Output: "${buildTag(test)}"`);
  });
};

testBuildTag();
