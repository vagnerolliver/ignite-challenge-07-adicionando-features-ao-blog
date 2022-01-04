import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const formatDatePtBR = (date: Date): string => {
  return format(date, 'd MMM yyyy', {
    locale: ptBR,
  });
};
