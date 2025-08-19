import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform<T>(items: T[], value: string, property: keyof T): T[] {
    if (!items) return [];
    if (!value) return items;
    
    return items.filter(item => item[property] === value);
  }
}