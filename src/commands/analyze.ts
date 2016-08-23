/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {Analyzer} from 'polymer-analyzer';
import {Element} from 'polymer-analyzer/lib/model/model';
import {FSUrlLoader} from 'polymer-analyzer/lib/url-loader/fs-url-loader';
import {PackageUrlResolver} from 'polymer-analyzer/lib/url-loader/package-url-resolver';
import * as logging from 'plylog';
import {Command} from './command';
import {generateElementMetadata} from 'polymer-analyzer/lib/generate-elements';

let logger = logging.getLogger('cli.command.analyze');

export class AnalyzeCommand implements Command {
  name = 'analyze';

  description = 'Analyzes the input file with the Polymer Analyzer';

  args = [{
    name: 'input',
    description: 'The file to analyze',
    defaultOption: true,
    multiple: true,
  }];

  async run(options, config): Promise<any> {
    if (!options || !options.input) {
      logger.debug('no file given');
      return;
    }

    const analyzer = new Analyzer({
      urlLoader: new FSUrlLoader(config.root),
      urlResolver: new PackageUrlResolver(),
    });

    const elements = new Set<Element>();

    for (const input of options.input) {
      const document = await analyzer.analyze(input);
      const docElements = Array.from(document.getByKind('element'))
          .filter((e) => !e.sourceRange.file.startsWith('bower_components'));
      docElements.forEach((e) => elements.add(e));
    }
    const metadata = generateElementMetadata(Array.from(elements), '');
    console.log(JSON.stringify(metadata, null, 2));
  }
}
