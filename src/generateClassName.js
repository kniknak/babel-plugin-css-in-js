import compressClassName from './compressClassName';
import splitSelector from './utils/splitSelector';

const invalidChars = /[^_a-z0-9-]/ig;

export default function generateClassName(id, options) {
  let result = '';

  if (options.prefix) {
    result += options.prefix.replace(invalidChars, '_') + '-';
  } else if (options.prefixes) {
    result += options.prefixes.map(p => p.replace(invalidChars, '_')).join('-') + '-';
  }

  result += id;

  result = result
      .replace("modules_", "")
      .replace("server_", "")
      .replace("tmp-build_", "")
      .replace("tmp_", "")
      .replace("dist_", "")
      .replace("_tsx-", "-")
      .replace("_jsx-", "-")
      .replace("_js-", "-")
      .replace("_ts-", "-")
  if (options.compressClassNames) {
    const [className, selector] = splitSelector(result);
    return compressClassName(className, options) + selector;
  }

  return result;
}
