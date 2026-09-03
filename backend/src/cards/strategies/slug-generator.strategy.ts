import { Injectable } from '@nestjs/common';
import { generateSlug } from '../../common/utils/slug.generator.js';

export type SlugGeneratorStrategy = {
  generate: () => string;
};

@Injectable()
export class NanoidSlugGenerator implements SlugGeneratorStrategy {
  generate(): string {
    return generateSlug();
  }
}
