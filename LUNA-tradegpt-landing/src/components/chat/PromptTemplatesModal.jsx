import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';
import { Agent } from '@/types';
import { useSelectedWorkspace } from '../../hooks/useSelectedWorkspace';
import { PromptTemplate, getPromptTemplatesByAgent, renderPromptTemplate } from '../../services/api';
import { Skeleton } from '../ui/skeleton';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Search, ChevronLeft, ChevronRight, Sparkles, Copy, Eye } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

/**
 * @typedef {Object} PromptTemplatesModalProps
 * @property {boolean} open
 * @property {function} onOpenChange
 * @property {Agent|null} agent
 * @property {function} [onSelectPrompt]
 */

// Helper function to get category string
const getCategoryString = (category, t) => {
  if (category && typeof category === 'object' && category.String) {
    return category.String;
  }
  return typeof category === 'string' ? category : t('promptTemplates.other');
};

// Group templates by category
const groupTemplatesByCategory = (templates, t) => {
  const groups = {};
  
  templates.forEach(template => {
    const categoryName = getCategoryString(template.category, t);
    if (!groups[categoryName]) {
      groups[categoryName] = [];
    }
    groups[categoryName].push(template);
  });
  
  return groups;
};

export const PromptTemplatesModal = ({
  open,
  onOpenChange,
  agent,
  onSelectPrompt
}) => {
  const { toast } = useToast();
  const { workspace } = useSelectedWorkspace();
  const { t } = useLanguage();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [renderedContent, setRenderedContent] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [total, setTotal] = useState(0);
  
  const limit = 10;

  useEffect(() => {
    if (open && agent?.id) {
      setCurrentPage(1);
      setSearchQuery('');
      setSelectedCategory('');
      loadTemplates();
    }
  }, [open, agent?.id]);

  useEffect(() => {
    if (open && agent?.id) {
      loadTemplates();
    }
  }, [currentPage, searchQuery, selectedCategory]);

  const loadTemplates = async () => {
    if (!agent?.id) return;
    
    setIsLoading(true);
    try {
      const response = await getPromptTemplatesByAgent(agent.id, {
        limit,
        offset: (currentPage - 1) * limit,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
      });
      
      setTemplates(response.data || []);
      setTotalPages(response.total_pages || 1);
      setTotal(response.total || 0);
      
      // Auto-select the first template if available and no template is selected
      if (response.data && response.data.length > 0 && !selectedTemplate) {
        handleSelectTemplate(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading prompt templates:', error);
      toast({
        title: t("promptTemplates.error"),
        description: t("promptTemplates.loadError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = async (template) => {
    if (!agent?.id || !workspace?.id) return;
    
    setSelectedTemplate(template);
    setIsRendering(true);
    
    try {
      const response = await renderPromptTemplate(template.id, {
        agent_id: agent.id,
        workspace_id: workspace.id
      });
      
      setRenderedContent(response.rendered_content);
    } catch (error) {
      console.error('Error rendering prompt template:', error);
      toast({
        title: t("promptTemplates.error"),
        description: t("promptTemplates.renderError"),
        variant: "destructive",
      });
    } finally {
      setIsRendering(false);
    }
  };

  const handleUsePrompt = () => {
    if (onSelectPrompt && renderedContent) {
      onSelectPrompt(renderedContent);
      onOpenChange(false);
    }
  };

  const handleCopyPrompt = () => {
    if (renderedContent) {
      navigator.clipboard.writeText(renderedContent);
      toast({
        title: "Đã sao chép",
        description: "Nội dung prompt đã được sao chép vào clipboard.",
      });
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1);
  };

  // Get unique categories for filtering
  const categories = Array.from(new Set(templates.map(template => getCategoryString(template.category, t))));
  const groupedTemplates = groupTemplatesByCategory(templates, t);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">{t('promptTemplates.title')}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {t('promptTemplates.description', { agentName: agent?.name, total: total })}
              </p>
            </div>
          </div>
          
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('promptTemplates.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <ScrollArea className="w-full sm:w-auto">
              <div className="flex gap-2 pb-2">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 whitespace-nowrap"
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col lg:flex-row h-[calc(90vh-140px)] min-h-0">
          {/* Template list */}
          <div className="w-full lg:w-2/5 border-b lg:border-b-0 lg:border-r border-border flex flex-col">
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-3">
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-3 w-full mb-1" />
                          <Skeleton className="h-3 w-2/3" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : Object.keys(groupedTemplates).length > 0 ? (
                  <div className="p-4 space-y-4">
                    {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                          <Separator className="flex-1" />
                          <Badge variant="secondary" className="text-xs font-medium">
                            {category} ({categoryTemplates.length})
                          </Badge>
                          <Separator className="flex-1" />
                        </div>
                        
                        <div className="space-y-2">
                          {categoryTemplates.map((template) => (
                            <Card
                              key={template.id}
                              className={`cursor-pointer transition-all duration-200 ${
                                selectedTemplate?.id === template.id 
                                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                              onClick={() => handleSelectTemplate(template)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm mb-1 truncate">
                                      {template.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                      {template.description}
                                    </p>
                                  </div>
                                  {template.is_featured && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {t('promptTemplates.featured')}
                                    </Badge>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="p-4 bg-gray-100 rounded-full mb-4 dark:bg-gray-800">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-2">{t("promptTemplates.notFound")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || selectedCategory 
                        ? t("promptTemplates.tryDifferentSearch")
                        : t("promptTemplates.noPrompts")
                      }
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
            
            {/* Pagination */}
            {(totalPages > 1 || total > limit) && (
              <div className="p-3 border-t border-border bg-background shrink-0">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Trang {currentPage} / {Math.max(totalPages, Math.ceil(total / limit))} • {total} items
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(Math.max(totalPages, Math.ceil(total / limit)), p + 1))}
                      disabled={currentPage >= Math.max(totalPages, Math.ceil(total / limit))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Template preview */}
          <div className="w-full lg:w-3/5 flex flex-col min-h-0">
            {selectedTemplate ? (
              <>
                <Card className="m-4 mb-0 shrink-0">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base mb-1 truncate">{selectedTemplate.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                      </div>
                      <div className="flex gap-2 ml-3">
                        <Badge variant="outline">
                          {getCategoryString(selectedTemplate.category, t)}
                        </Badge>
                        {selectedTemplate.is_featured && (
                          <Badge variant="secondary">{t('promptTemplates.featured')}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
                
                <div className="flex-1 p-4 min-h-0">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">{t('promptTemplates.content')}</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyPrompt}
                      disabled={!renderedContent || isRendering}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      {t('promptTemplates.copy')}
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-full">
                    <Textarea
                      className="min-h-[200px] resize-none"
                      value={isRendering ? t('promptTemplates.loading') : renderedContent}
                      readOnly
                      disabled={isRendering}
                    />
                  </ScrollArea>
                </div>
                
                <div className="p-4 border-t border-border bg-muted/30 shrink-0">
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      {t('promptTemplates.close')}
                    </Button>
                    <Button 
                      onClick={handleUsePrompt}
                      disabled={!renderedContent || isRendering}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('promptTemplates.use')}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <div className="p-4 bg-gray-100 rounded-full mb-4 mx-auto w-fit dark:bg-gray-800">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">{t('promptTemplates.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('promptTemplates.selectTemplateDescription')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};