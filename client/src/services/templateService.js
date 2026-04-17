import { getMyTemplates, updateTemplate } from './itineraryService';

export const fetchTemplates = () => getMyTemplates();

export const toggleTemplateVisibility = (id, isPublic, extraData = {}) =>
  updateTemplate(id, { isPublic, ...extraData });

export const updateTemplateDetails = (id, data) => updateTemplate(id, data);
