import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { TopographicExportStudioScreen } from './TopographicExportStudioScreen';

test('topographic export studio exposes the selection, evidence, layer, and output surfaces', () => {
  const html = renderToStaticMarkup(React.createElement(TopographicExportStudioScreen));

  assert.match(html, /Topographic Export Studio/);
  assert.match(html, /Selection/);
  assert.match(html, /Evidence mode/);
  assert.match(html, /SYNTHETIC PREVIEW/);
  assert.match(html, /DXF/);
  assert.match(html, /IFC/);
  assert.match(html, /GLTF/);
  assert.match(html, /TIFF/);
  assert.match(html, /50/);
});
