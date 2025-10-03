import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { useCreateScheduledTask } from '../hooks/useScheduledTasks';
import { useSelectedWorkspace } from '../hooks/useSelectedWorkspace';
import { getAgentTasks } from '../services/api';
import { usePublicAgents } from '../hooks/useAgentsByFolders';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ScrollArea } from '../components/ui/scroll-area';
import { useLanguage } from '../hooks/useLanguage';

const CreateScheduledTaskDialog = ({ open, onOpenChange }) => {
  const { workspace } = useSelectedWorkspace();
  const createTask = useCreateScheduledTask();
  const { t } = useLanguage();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [agentId, setAgentId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [scheduleType, setScheduleType] = useState('daily');
  const [time, setTime] = useState('09:00');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [cronExpression, setCronExpression] = useState('');
  const [isFixedPrompt, setIsFixedPrompt] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [autoCreateConversation, setAutoCreateConversation] = useState(true);
  const [conversationTemplate, setConversationTemplate] = useState('');
  const [message, setMessage] = useState('');

  // Thêm state cho input động theo execution_config
  const [inputValues, setInputValues] = useState({});

  // State cho Step 3: Items Management
  const [executionMode, setExecutionMode] = useState('sequential');
  const [onComplete, setOnComplete] = useState('restart');
  const [inputList, setInputList] = useState([]);

  // State for file import and mapping
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const fileInputRef = useRef(null);

  // Lấy danh sách agent public
  const { data: agentsData, isLoading: isLoadingAgents } = usePublicAgents(1, 1000);
  const agents = Array.isArray(agentsData?.data?.data) ? agentsData.data.data : [];
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Load tasks when agent changes
  useEffect(() => {
    if (agentId) {
      setLoadingTasks(true);
      getAgentTasks(agentId)
        .then(response => {
          setTasks(Array.isArray(response.data) ? response.data : []);
        })
        .catch(error => {
          setTasks([]);
          // Có thể show toast lỗi ở đây
        })
        .finally(() => {
          setLoadingTasks(false);
        });
    } else {
      setTasks([]);
    }
  }, [agentId]);

  // Khi taskId thay đổi, lấy execution_config của task đó để render input động
  useEffect(() => {
    const selectedTask = tasks.find(t => t.id === taskId);
    if (selectedTask && selectedTask.execution_config) {
      const initial = {};
      Object.keys(selectedTask.execution_config).forEach(key => {
        initial[key] = String(selectedTask.execution_config[key] || '');
      });
      setInputValues(initial);
      
      // Initialize items with one empty item based on task fields
      const emptyItem = {};
      Object.keys(selectedTask.execution_config).forEach(key => {
        emptyItem[key] = '';
      });
      setInputList([emptyItem]);
    } else {
      setInputValues({});
      setInputList([]);
    }
    // Reset mapping when task changes
    setColumnMapping({});
    // Check if step 1 should be marked as completed
    validateStep1();
  }, [taskId, tasks]);

  // Validate Step 1 completion - simplified to only check basic info
  const validateStep1 = () => {
    // Step 1 only needs: name, agent, and either task or message
    const hasBasicInfo = name.trim() && agentId;
    const hasTaskOrMessage = taskId || message.trim();
    
    const isCompleted = Boolean(hasBasicInfo && hasTaskOrMessage);
    setStep1Completed(isCompleted);
  };

  // Validate Step 2 completion
  const validateStep2 = () => {
    let isValid = false;
    switch (scheduleType) {
      case 'daily':
        isValid = !!time;
        break;
      case 'weekly':
        isValid = !!time && dayOfWeek >= 0 && dayOfWeek <= 6;
        break;
      case 'monthly':
        isValid = !!time && dayOfMonth >= 1 && dayOfMonth <= 31;
        break;
      case 'custom':
        isValid = !!cronExpression.trim();
        break;
    }
    setStep2Completed(isValid);
  };

  // Watch for changes that affect step validations
  React.useEffect(() => {
    validateStep1();
  }, [name, agentId, taskId, message]);

  React.useEffect(() => {
    validateStep2();
  }, [scheduleType, time, dayOfWeek, dayOfMonth, cronExpression]);

  // Watch for changes that affect step 3 validation
  React.useEffect(() => {
    validateStep3();
  }, [inputList, taskId, tasks]);

  const handleNextStep = () => {
    if (step1Completed && currentStep === 1) {
      setCurrentStep(2);
    } else if (step2Completed && currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentStep !== 3 || !validateStep3() || !workspace?.id) {
      return;
    }

    // Build the schedule config
    const scheduleConfig = {};
    
    switch (scheduleType) {
      case 'daily':
        scheduleConfig.time = time;
        break;
      case 'weekly':
        scheduleConfig.day_of_week = dayOfWeek;
        scheduleConfig.time = time;
        break;
      case 'monthly':
        scheduleConfig.day_of_month = dayOfMonth;
        scheduleConfig.time = time;
        break;
      case 'custom':
        scheduleConfig.cron_expression = cronExpression;
        break;
    }

    let conversationTemplate = null;

    if (taskId && inputList.length > 0) {
      const selectedTask = tasks.find(t => t.id === taskId);
      const executionConfig = selectedTask?.execution_config || {};
      
      // Create template fields (empty placeholders)
      const templateFields = {};
      Object.keys(executionConfig).forEach(key => {
        templateFields[key] = "";
      });
      
      // Create input mapping (field -> field)
      const inputMapping = {};
      Object.keys(executionConfig).forEach(key => {
        inputMapping[key] = key;
      });
      
      conversationTemplate = {
        input_data: {
          ...templateFields,
          data_source_config: {
            source_details: { items: inputList },
            input_mapping: inputMapping,
            execution_mode: executionMode,
            on_complete: onComplete
          }
        }
      };
    } else if (message.trim()) {
      conversationTemplate = {
        input_data: {
          message: message.trim()
        }
      };
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      agent_id: agentId,
      workspace_id: workspace.id,
      task_id: taskId || undefined,
      schedule_type: scheduleType,
      schedule_config: scheduleConfig,
      auto_create_conversation: autoCreateConversation,
      ...(conversationTemplate && { conversation_template: conversationTemplate })
    };

    createTask.mutate(payload, {
      onSuccess: () => {
        handleClose();
      }
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryStr = event.target?.result;
        if (binaryStr) {
          const workbook = XLSX.read(binaryStr, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          if (json.length > 0) {
            const headers = json[0];
            const data = XLSX.utils.sheet_to_json(worksheet);
            setTableHeaders(headers);
            setTableData(data);
            // Reset mapping when a new file is uploaded
            setColumnMapping({});
          }
        }
      };
      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setStep1Completed(false);
    setStep2Completed(false);
    setName('');
    setDescription('');
    setAgentId('');
    setTaskId('');
    setScheduleType('daily');
    setTime('09:00');
    setDayOfWeek(1);
    setDayOfMonth(1);
    setCronExpression('');
    setIsFixedPrompt(true);
    setCustomPrompt('');
    setAutoCreateConversation(true);
    setConversationTemplate('');
    setMessage('');
    setInputValues({});
    setExecutionMode('sequential');
    setOnComplete('restart');
    setInputList([]);
    setFile(null);
    setTableData([]);
    setTableHeaders([]);
    setColumnMapping({});
    onOpenChange(false);
  };

  // Items management functions
  const addItem = () => {
    const selectedTask = tasks.find(t => t.id === taskId);
    if (selectedTask && selectedTask.execution_config) {
      const emptyItem = {};
      Object.keys(selectedTask.execution_config).forEach(key => {
        emptyItem[key] = '';
      });
      setInputList([...inputList, emptyItem]);
    }
  };

  const removeItem = (index) => {
    if (inputList.length > 1) {
      const newItems = inputList.filter((_, i) => i !== index);
      setInputList(newItems);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...inputList];
    newItems[index][field] = value;
    setInputList(newItems);
  };

  const validateStep3 = () => {
    if (!taskId) return true; // Skip validation if no task selected
    
    // Check if all items have all required fields filled
    const selectedTask = tasks.find(t => t.id === taskId);
    if (!selectedTask || !selectedTask.execution_config) return false;
    
    const requiredFields = Object.keys(selectedTask.execution_config);
    return inputList.length > 0 && inputList.every(item => 
      requiredFields.every(field => item[field] && item[field].trim())
    );
  };

  const getScheduleConfigFields = () => {
    switch (scheduleType) {
      case 'daily':
        return (
          <div className="space-y-2">
            <Label htmlFor="time">Thời gian</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        );
      
      case 'weekly':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfWeek">Ngày trong tuần</Label>
              <Select value={dayOfWeek.toString()} onValueChange={(value) => setDayOfWeek(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Chủ nhật</SelectItem>
                  <SelectItem value="1">Thứ 2</SelectItem>
                  <SelectItem value="2">Thứ 3</SelectItem>
                  <SelectItem value="3">Thứ 4</SelectItem>
                  <SelectItem value="4">Thứ 5</SelectItem>
                  <SelectItem value="5">Thứ 6</SelectItem>
                  <SelectItem value="6">Thứ 7</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Thời gian</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
        );
      
      case 'monthly':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dayOfMonth">Ngày trong tháng</Label>
              <Input
                id="dayOfMonth"
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Thời gian</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
        );
      
      case 'custom':
        return (
          <div className="space-y-2">
            <Label htmlFor="cronExpression">Cron Expression</Label>
            <Input
              id="cronExpression"
              placeholder="0 9 * * 1"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Format: phút giờ ngày tháng thứ (VD: 0 9 * * 1 = 9h sáng thứ 2)
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto text-white">
        <DialogHeader>
          <DialogTitle>Tạo task theo lịch trình</DialogTitle>
          
          {/* Step Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step1Completed ? 'bg-green-500 text-white' : currentStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step1Completed ? '✓' : '1'}
              </div>
              <span className={`ml-2 text-xs font-medium ${
                currentStep === 1 ? 'text-blue-600' : step1Completed ? 'text-green-600' : 'text-gray-500'
              }`}>
                Config nhiệm vụ
              </span>
            </div>
            
            <div className={`w-8 h-0.5 ${
              step1Completed ? 'bg-green-500' : 'bg-gray-200'
            }`}></div>
            
            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step2Completed ? 'bg-green-500 text-white' : currentStep === 2 ? 'bg-blue-500 text-white' : step1Completed ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-400'
              }`}>
                {step2Completed ? '✓' : '2'}
              </div>
              <span className={`ml-2 text-xs font-medium ${
                currentStep === 2 ? 'text-blue-600' : step2Completed ? 'text-green-600' : step1Completed ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Config thời gian
              </span>
            </div>

            <div className={`w-8 h-0.5 ${
              step2Completed ? 'bg-green-500' : 'bg-gray-200'
            }`}></div>
            
            {/* Step 3 */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 3 ? 'bg-blue-500 text-white' : step2Completed ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-400'
              }`}>
                3
              </div>
              <span className={`ml-2 text-xs font-medium ${
                currentStep === 3 ? 'text-blue-600' : step2Completed ? 'text-gray-600' : 'text-gray-400'
              }`}>
                Config Items
              </span>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Task Configuration */}
          {currentStep === 1 && (
            <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên task *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên task"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả task"
                rows={3}
              />
            </div>
          </div>

          {/* Agent & Task Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent">{t('agent.name')} *</Label>
              <Select value={agentId} onValueChange={setAgentId} disabled={isLoadingAgents}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingAgents ? t('common.loading') : t('agent.name')} />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(agents) && agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task">{t('tasks')}</Label>
              <Select value={taskId === '' ? 'none' : taskId} onValueChange={value => setTaskId(value === 'none' ? '' : value)} disabled={!agentId || loadingTasks}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingTasks ? t('common.loading') : t('tasks')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('common.none') || '---'}</SelectItem>
                  {tasks.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Message Input (if no task is selected) */}
          {!taskId && (
            <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <Label className="text-lg font-semibold text-gray-700 dark:text-gray-300">Tin nhắn</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">{t('scheduled_task.message_label')}</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={t('scheduled_task.message_placeholder')}
                  rows={3}
                  className="bg-white dark:bg-gray-800"
                  required={!taskId}
                />
              </div>
            </div>
          )}

              {/* Step 1 Navigation */}
              <div className="flex justify-between pt-4">
                <div></div>
                <Button 
                  type="button" 
                  onClick={handleNextStep}
                  disabled={!step1Completed}
                  className={`${
                    step1Completed 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Tiếp theo: Config thời gian →
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 2: Schedule Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Schedule Configuration */}
              <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <Label className="text-lg font-semibold text-blue-700 dark:text-blue-300">Lịch trình *</Label>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'daily', label: 'Hàng ngày', icon: '🌅' },
                    { value: 'weekly', label: 'Hàng tuần', icon: '📊' },
                    { value: 'monthly', label: 'Hàng tháng', icon: '🗓️' },
                    { value: 'custom', label: 'Tùy chỉnh', icon: '⚙️' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setScheduleType(option.value)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                        scheduleType === option.value
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="text-lg mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4">
                  {getScheduleConfigFields()}
                </div>
              </div>

              {/* Conversation Settings */}
              <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <Label className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">Cài đặt cuộc hội thoại</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoCreateConversation"
                    checked={autoCreateConversation}
                    onCheckedChange={setAutoCreateConversation}
                  />
                  <Label htmlFor="autoCreateConversation" className="font-medium">Tự động tạo cuộc hội thoại mới</Label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                  Mỗi lần chạy task sẽ tạo một cuộc hội thoại mới với agent
                </p>
              </div>

              {/* Step 2 Navigation */}
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  ← Quay lại: Config nhiệm vụ
                </Button>
                <Button 
                  type="button" 
                  onClick={handleNextStep}
                  disabled={!step2Completed}
                  className={`${
                    step2Completed 
                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Tiếp theo: Config Items →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Items Management */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Execution Settings */}
              <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <Label className="text-lg font-semibold text-purple-700 dark:text-purple-300">⚙️ Cài đặt thực thi</Label>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Execution Mode */}
                  <div className="space-y-3">
                    <Label className="font-medium">Chế độ thực thi:</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="executionMode"
                          value="sequential"
                          checked={executionMode === 'sequential'}
                          onChange={(e) => setExecutionMode(e.target.value)}
                          className="text-purple-500"
                        />
                        <span>🔄 Sequential (Tuần tự)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="executionMode"
                          value="batch"
                          checked={executionMode === 'batch'}
                          onChange={(e) => setExecutionMode(e.target.value)}
                          className="text-purple-500"
                        />
                        <span>📦 Batch (Theo lô)</span>
                      </label>
                    </div>
                  </div>

                  {/* On Complete Action */}
                  <div className="space-y-3">
                    <Label className="font-medium">Khi hoàn thành:</Label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="onComplete"
                          value="pause"
                          checked={onComplete === 'pause'}
                          onChange={(e) => setOnComplete(e.target.value)}
                          className="text-purple-500"
                        />
                        <span>⏸️ Pause (Tạm dừng)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="onComplete"
                          value="restart"
                          checked={onComplete === 'restart'}
                          onChange={(e) => setOnComplete(e.target.value)}
                          className="text-purple-500"
                        />
                        <span>🔄 Restart (Khởi động lại)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="onComplete"
                          value="delete"
                          checked={onComplete === 'delete'}
                          onChange={(e) => setOnComplete(e.target.value)}
                          className="text-purple-500"
                        />
                        <span>🗑️ Delete (Xóa task)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Input Methods - Only show when task is selected */}
              {taskId && (
                <>
                  {/* Dynamic input list cho nhập nhiều giá trị */}
                  <div className="mt-4">
                    <Label className="block mb-2 font-medium">Danh sách giá trị</Label>
                    <div className="space-y-2">
                      {inputList.map((row, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          {Object.keys(inputValues).map((key) => (
                            <Input
                              key={key}
                              className="flex-1"
                              placeholder={`Nhập ${key}`}
                              value={row[key] || ''}
                              onChange={e => {
                                const newList = [...inputList];
                                newList[idx] = { ...newList[idx], [key]: e.target.value };
                                setInputList(newList);
                              }}
                            />
                          ))}
                          <button
                            type="button"
                            className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-600"
                            onClick={() => setInputList(inputList.filter((_, i) => i !== idx))}
                            disabled={inputList.length === 1}
                            title="Xóa dòng"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="mt-2 px-3 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700"
                        onClick={() => setInputList([...inputList, Object.fromEntries(Object.keys(inputValues).map(k => [k, '']))])}
                      >
                        + Thêm dòng
                      </button>
                    </div>
                    
                    {/* Hoặc Import File */}
                    <div className="mt-6 pt-4 border-t">
                      <Label className="block mb-2 font-medium">Hoặc import từ file</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white dark:bg-gray-800"
                        >
                          📁 Chọn file CSV/Excel
                        </Button>
                        {file && (
                          <span className="text-sm text-green-600">
                            ✓ {file.name} ({tableData.length} dòng)
                          </span>
                        )}
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {/* Column Mapping */}
                      {tableHeaders.length > 0 && Object.keys(inputValues).length > 0 && (
                        <div className="mt-4">
                          <Label className="block mb-2 font-medium">Mapping cột</Label>
                          <div className="space-y-2">
                            {Object.keys(inputValues).map((key) => (
                              <div key={key} className="flex items-center gap-2">
                                <Label className="w-20 text-sm">{key}:</Label>
                                <Select
                                  value={columnMapping[key] || ''}
                                  onValueChange={(value) => {
                                    const newMapping = { ...columnMapping, [key]: value };
                                    setColumnMapping(newMapping);
                                    
                                    // Auto-fill inputList when mapping is complete
                                    const requiredKeys = Object.keys(inputValues);
                                    const allMapped = requiredKeys.every(k => newMapping[k]);
                                    
                                    if (allMapped && tableData.length > 0) {
                                      // Map data from file to inputList format
                                      const mappedData = tableData.map(row => {
                                        const item = {};
                                        requiredKeys.forEach(k => {
                                          item[k] = String(row[newMapping[k]] || '');
                                        });
                                        return item;
                                      });
                                      
                                      // Show first 5 items in inputList
                                      const displayItems = mappedData.slice(0, 5);
                                      setInputList(displayItems);
                                    }
                                  }}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Chọn cột" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tableHeaders.map((header) => (
                                      <SelectItem key={header} value={header}>
                                        {header}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Data Preview */}
                      {tableData.length > 0 && (
                        <div className="mt-4">
                          <Label className="block mb-2 font-medium">Xem trước dữ liệu ({tableData.length} items)</Label>
                          <ScrollArea className="h-32 w-full border rounded">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  {tableHeaders.map((header) => (
                                    <TableHead key={header} className="text-xs">{header}</TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {tableData.slice(0, 3).map((row, idx) => (
                                  <TableRow key={idx}>
                                    {tableHeaders.map((header) => (
                                      <TableCell key={header} className="text-xs">
                                        {String(row[header] || '')}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                          {tableData.length > 5 && (
                            <p className="text-xs text-gray-500 mt-2">
                              {tableData.length - 5} dòng còn lại
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Step 3 Navigation */}
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={handlePrevStep}>
                  ← Quay lại: Config thời gian
                </Button>
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Hủy
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTask.isPending || !validateStep3()}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {createTask.isPending ? t('common.loading') : '✓ Tạo Task'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateScheduledTaskDialog;