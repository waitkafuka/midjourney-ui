import { useEffect, useState, useCallback } from 'react';
import { Select, Input, Radio, Slider, Button, message, Upload, Card, Modal, Alert, Tooltip } from 'antd';
import { UploadOutlined, PlayCircleOutlined, CustomerServiceOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { requestAliyunArt } from '../../request/http';
import Head from 'next/head';
import AliyunOSSUploader from "../../components/OssUploader";
import type { UploadFile } from 'antd/es/upload/interface';
import PaintingPoint from '../../components/paintingPoint';
import { useSelector } from 'react-redux';

const { TextArea } = Input;

interface DigitalHuman {
    digital_human_id: number;
    digital_name: string;
    scene_id: string;
    image_task_id: string;
    image_task_name: string;
    voice_task_id: string;
    voice_id: string;
    voice_local_name: string;
    video_url: string;
    training_audio_url: string;
}

const Playground: React.FC = () => {
    const router = useRouter();
    const { recordId } = router.query;

    // 状态管理
    const [digitalHumans, setDigitalHumans] = useState<DigitalHuman[]>([]);
    const [imageModels, setImageModels] = useState<any[]>([]);
    const [voiceModels, setVoiceModels] = useState<any[]>([]);
    const [selectedSceneId, setSelectedSceneId] = useState<string>('');
    const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
    const [videoName, setVideoName] = useState<string>('');
    const [speed, setSpeed] = useState<number>(1);
    const [createMode, setCreateMode] = useState<number>(0);
    const [inputType, setInputType] = useState<'text' | 'audio'>('text');
    const [inputText, setInputText] = useState<string>('');
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [generating, setGenerating] = useState<boolean>(false);
    const [generatedVideo, setGeneratedVideo] = useState<string>('');
    const [previewVideoUrl, setPreviewVideoUrl] = useState<string>('');
    const [previewAudioUrl, setPreviewAudioUrl] = useState<string>('');
    const [isVideoPreviewVisible, setIsVideoPreviewVisible] = useState(false);
    const [isAudioPreviewVisible, setIsAudioPreviewVisible] = useState(false);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
    const [estimatedPoints, setEstimatedPoints] = useState<number>(0);

    // 添加用户信息获取
    const user = useSelector((state: any) => state.user.info);

    // 获取数字人列表
    const fetchDigitalHumans = async () => {
        try {
            const response = await requestAliyunArt('digital-human/my-digital-humans', { all: true });
            if (response.rows) {
                setDigitalHumans(response.rows);

                // 修改筛选逻辑，确保有必要的字段
                const images = response.rows.filter((item: DigitalHuman) =>
                    item.scene_id && item.image_task_name
                );
                const voices = response.rows.filter((item: DigitalHuman) =>
                    item.voice_id && item.voice_local_name
                );

                setImageModels(images);
                setVoiceModels(voices);

                // 如果有recordId，设置对应的选项
                if (recordId) {
                    const matchedModel = response.rows.find(
                        (item: DigitalHuman) => item.digital_human_id === Number(recordId)
                    );
                    if (matchedModel) {
                        setSelectedSceneId(matchedModel.scene_id);
                        setSelectedVoiceId(matchedModel.voice_id);
                    }
                }
                // 如果没有recordId且有可用的模型，默认选中第一个
                else if (images.length > 0) {
                    setSelectedSceneId(images[0].scene_id);
                    // 如果第一个模型同时有声音模型，也设置声音
                    if (images[0].voice_id) {
                        setSelectedVoiceId(images[0].voice_id);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching digital humans:', error);
            message.error('获取数字人列表失败');
        }
    };

    // 添加计算预估点数的函数
    const calculateEstimatedPoints = useCallback(() => {
        const basePointsPerMinute = 80; // 基础每分钟点数
        let estimatedMinutes = 0;

        if (inputType === 'text' && inputText) {
            // 假设200字/分钟
            estimatedMinutes = inputText.length / 200;
        } else if (inputType === 'audio' && audioUrl) {
            // 获取音频时长（这里需要实现获取音频时长的逻辑）
            // 暂时返回0，等待音频上传后更新
            return;
        }

        // 最小计费时长为0.5分钟
        estimatedMinutes = Math.max(0.5, estimatedMinutes);

        // 计算预估点数
        let points = Math.ceil(estimatedMinutes * basePointsPerMinute);

        // 如果是超清模式，点数翻倍
        if (createMode === 1) {
            points *= 2;
        }

        setEstimatedPoints(points);
    }, [inputType, inputText, audioUrl, createMode]);

    // 在文字变化时更新预估点数
    useEffect(() => {
        calculateEstimatedPoints();
    }, [inputText, createMode, inputType]);

    // 修改音频上传处理函数
    const handleAudioUpload = async (fileList: UploadFile[]) => {
        // 如果没有文件，说明是移除操作
        if (fileList.length === 0) {
            setAudioUrl('');
            setEstimatedPoints(0);
            return;
        }

        // 有文件且有URL，说明是新上传
        if (fileList[0]?.url) {
            setAudioUrl(fileList[0].url);

            // 创建一个音频元素来获取时长
            const audio = new Audio(fileList[0].url);
            audio.addEventListener('loadedmetadata', () => {
                const durationInMinutes = audio.duration / 60;
                const basePointsPerMinute = 80;
                // 最小计费时长为0.5分钟
                let points = Math.ceil(Math.max(0.5, durationInMinutes) * basePointsPerMinute);

                // 如果是超清模式，点数翻倍
                if (createMode === 1) {
                    points *= 2;
                }

                setEstimatedPoints(points);
            });
        }
    };

    // 添加一个useEffect来监听createMode的变化，重新计算音频的点数
    useEffect(() => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.addEventListener('loadedmetadata', () => {
                const durationInMinutes = audio.duration / 60;
                const basePointsPerMinute = 80;
                let points = Math.ceil(Math.max(0.5, durationInMinutes) * basePointsPerMinute);

                if (createMode === 1) {
                    points *= 2;
                }

                setEstimatedPoints(points);
            });
        }
    }, [createMode, audioUrl]);

    // 生成视频
    const generateVideo = async () => {
        // 基础校验
        if (!selectedSceneId) {
            message.error('请选择形象模型');
            return;
        }
        if (!videoName) {
            message.error('请输入视频名称');
            return;
        }
        if (inputType === 'text' && !selectedVoiceId) {
            message.error('请选择声音模型');
            return;
        }
        if (inputType === 'text' && !inputText) {
            message.error('请输入文字内容');
            return;
        }
        if (inputType === 'audio' && !audioUrl) {
            message.error('请上传音频文件');
            return;
        }

        // 点数校验
        if (!user?.point_count) {
            message.error('请先登录');
            return;
        }

        if (user.point_count < estimatedPoints) {
            message.error(`点数不足，当前剩余${user.point_count}点，预计需要${estimatedPoints}点，请先购买点数`, 10);
            return;
        }

        setGenerating(true);
        try {
            const params: any = {
                sceneId: selectedSceneId,
                videoName,
                createMode,
                skipRandom: 0,
            };

            if (inputType === 'text') {
                params.textToVideo = {
                    text: inputText,
                    speed,
                    voiceId: selectedVoiceId,
                };
            } else {
                params.audioUrl = audioUrl; // 音频输入时传递音频URL
            }

            const result = await requestAliyunArt('digital-human/create-digital-human-video', params);
            if (result.id) {
                message.success('视频生成任务已提交');
                setGeneratedVideo(result.videoUrl);
            }
        } catch (error: any) {
            // 处理错误信息
            if (error.code === 40022) {
                message.error('点数不足，请先购买点数');
            } else if (error.code === 40015) {
                message.error('请登录后再试');
                // 可以选择跳转到登录页
                // router.push('/login');
            } else {
                message.error(error.message || '生成视频失败');
            }
        } finally {
            setGenerating(false);
        }
    };

    // 修改预览处理函数
    const handlePreviewModel = () => {
        if (!selectedSceneId) {
            message.warning('请先选择形象模型');
            return;
        }

        const selectedModel = imageModels.find(model => model.scene_id === selectedSceneId);
        if (selectedModel?.video_url) {
            setPreviewVideoUrl(selectedModel.video_url);
            setIsVideoPreviewVisible(true);
        } else {
            message.error('该模型暂无预览视频');
        }
    };

    const handlePreviewVoice = () => {
        if (!selectedVoiceId) {
            message.warning('请先选择声音模型');
            return;
        }

        const selectedVoice = voiceModels.find(model => model.voice_id === selectedVoiceId);
        if (selectedVoice?.url) {
            setPreviewAudioUrl(selectedVoice.url);
            setIsAudioPreviewVisible(true);
        } else {
            message.error('该声音模型暂无试听音频');
        }
    };

    // 添加处理关闭预览的函数
    const handleCloseVideoPreview = () => {
        // 找到视频元素并暂停播放
        const videoElement = document.querySelector('.preview-video') as HTMLVideoElement;
        if (videoElement) {
            videoElement.pause();
        }
        setIsVideoPreviewVisible(false);
    };

    const handleCloseAudioPreview = () => {
        // 找到音频元素并暂停播放
        const audioElement = document.querySelector('.preview-audio') as HTMLAudioElement;
        if (audioElement) {
            audioElement.pause();
        }
        setIsAudioPreviewVisible(false);
    };

    useEffect(() => {
        fetchDigitalHumans();
    }, [recordId]);

    return (
        <div className="digital-playground-container">
            <Head>
                <title>数字人视频生成</title>
            </Head>

            <div className='dalle-point-box'>
                <PaintingPoint></PaintingPoint>
            </div>

            <Card className="main-card">
                <h1 className="page-title">数字人视频生成</h1>

                <div className="space-y-6">
                    {/* 视频名称 */}
                    <div className="form-item">
                        <label className="block text-sm font-medium mb-2">视频名称</label>
                        <Input
                            placeholder="请输入视频名称"
                            value={videoName}
                            onChange={e => setVideoName(e.target.value)}
                        />
                    </div>

                    {/* 形象模型选择 */}
                    <div className="form-item">
                        <label className="block text-sm font-medium mb-2">选择形象模型</label>
                        <Select
                            className="w-full"
                            placeholder="请选择形象模型"
                            value={selectedSceneId}
                            onChange={setSelectedSceneId}
                            options={imageModels.map(model => ({
                                value: model.scene_id,
                                label: `${model.image_task_name || '未命名'} (ID: ${model.scene_id})`,
                            }))}
                            notFoundContent="暂无可用的形象模型"
                        />
                        <Button
                            type="link"
                            icon={<PlayCircleOutlined />}
                            onClick={handlePreviewModel}
                            className="mt-2"
                        >
                            预览视频
                        </Button>
                    </div>

                    {/* 声音模型选择 */}
                    <div className="form-item">
                        <label className="block text-sm font-medium mb-2">选择声音模型</label>
                        <Select
                            className="w-full"
                            placeholder="请选择声音模型"
                            value={selectedVoiceId}
                            onChange={setSelectedVoiceId}
                            options={voiceModels.map(model => ({
                                value: model.voice_id,
                                label: `${model.voice_local_name || '未命名'} (ID: ${model.voice_id})`,
                            }))}
                            notFoundContent="暂无可用的声音模型"
                            disabled={inputType === 'audio'}
                        />
                        <Button
                            type="link"
                            icon={<CustomerServiceOutlined />}
                            onClick={handlePreviewVoice}
                            className="mt-2"
                            disabled={inputType === 'audio'}
                        >
                            试听音色
                        </Button>
                    </div>


                    {/* 高级选项折叠面板 */}
                    <div className="form-item">
                        <div
                            className="block text-sm font-medium mb-2 cursor-pointer"
                            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        >
                            <span className="more-options-icon">
                                <i className={`iconfont ${showAdvancedOptions ? 'icon-shuangshangjiantou-' : 'icon-shuangxiajiantou-'}`}></i>
                            </span>
                            高级选项
                        </div>

                        {showAdvancedOptions && (
                            <div className="space-y-4 mt-4">
                                {/* 生成模式 */}
                                <div className="form-item">
                                    <label className="block text-sm font-medium mb-2">生成模式</label>
                                    <Radio.Group value={createMode} onChange={e => setCreateMode(e.target.value)}>
                                        <Radio value={0}>高清模式</Radio>
                                        <Radio value={1}>超清模式</Radio>
                                    </Radio.Group>
                                </div>

                                {/* 输入类型 */}
                                <div className="form-item">
                                    <label className="block text-sm font-medium mb-2">
                                        输入类型
                                        <Tooltip title="如果上传音频，则以音频为准进行合成，语速不可调，并且不再需要选择声音模型。">
                                            <QuestionCircleOutlined style={{ marginLeft: '4px' }} />
                                        </Tooltip>
                                    </label>
                                    <Radio.Group value={inputType} onChange={e => setInputType(e.target.value)}>
                                        <Radio value="text">文字输入</Radio>
                                        <Radio value="audio">音频输入</Radio>
                                    </Radio.Group>
                                </div>

                                {/* 语音速度 */}
                                <div className="form-item">
                                    <label className="block text-sm font-medium mb-2">语音速度</label>
                                    <Slider
                                        min={0.5}
                                        max={1.5}
                                        step={0.1}
                                        value={speed}
                                        onChange={setSpeed}
                                        marks={{
                                            0.5: '慢',
                                            1: '正常',
                                            1.5: '快',
                                        }}
                                        disabled={inputType === 'audio'}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 文字输入或音频上传 */}
                    {inputType === 'text' ? (
                        <div className="form-item">
                            <label className="block text-sm font-medium mb-2">文字内容</label>
                            <TextArea
                                rows={4}
                                placeholder="请输入你要讲的台词文本，比如：“你好，我是数字人小明”"
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div className="form-item">
                            <label className="block text-sm font-medium mb-2">上传音频</label>
                            <AliyunOSSUploader
                                accept=".mp3,.wav"
                                maxSize={1024 * 1024 * 10}
                                onChange={handleAudioUpload}
                                buttonText="上传音频文件"
                            />
                        </div>
                    )}

                    {/* 预估点数显示 */}
                    {(inputText || audioUrl) && (
                        <div className="form-item">
                            <Alert
                                message={
                                    <div>
                                        <div>预估消耗点数：{estimatedPoints} 点</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            • 实际点数以最终生成视频时长为准
                                            {inputType === 'text' && '，文字预估仅供参考'}
                                        </div>
                                    </div>
                                }
                                type="info"
                                showIcon
                            />
                        </div>
                    )}

                    {/* 生成按钮 */}
                    <div className="form-item">
                        <Button
                            type="primary"
                            size="large"
                            block
                            loading={generating}
                            onClick={generateVideo}
                        >
                            {generating ? '生成中...' : '开始生成'}
                        </Button>
                    </div>
                    <Alert
                        message="价格说明"
                        description={
                            <div className="text-sm">
                                <div>• 生成价格为80点数/分钟（超清模式为2倍）</div>
                                <div>• 文字大约200字/分钟，仅作为估算，以实际时长为准</div>
                                <div>• 生成前会根据估算时长预扣点数，生成完毕后进行实际结算，多退少补</div>
                                <div>• 由于算力昂贵，生成成功后，不支持退款。如生成失败，则自动返还点数</div>
                                <div>• 生成时间大约5分钟，点击左侧“我的{'->'}我的视频”进行查看</div>
                            </div>
                        }
                        type="info"
                        showIcon
                        className="mb-6"
                    />
                </div>
            </Card>

            {/* 生成结果展示 */}
            {generatedVideo && (
                <Card title="生成结果" className="mt-6">
                    <video
                        src={generatedVideo}
                        controls
                        className="w-full rounded-lg"
                        style={{ maxHeight: '400px' }}
                    />
                </Card>
            )}

            {/* 添加预览弹窗 */}
            <Modal
                title="形象预览"
                open={isVideoPreviewVisible}
                onCancel={handleCloseVideoPreview}
                footer={null}
                width={800}
            >
                {previewVideoUrl && (
                    <video
                        src={previewVideoUrl}
                        controls
                        className="w-full preview-video"
                        style={{ maxHeight: '600px' }}
                    />
                )}
            </Modal>

            <Modal
                title="声音试听"
                open={isAudioPreviewVisible}
                onCancel={handleCloseAudioPreview}
                footer={null}
            >
                {previewAudioUrl && (
                    <audio
                        src={previewAudioUrl}
                        controls
                        className="w-full preview-audio"
                    />
                )}
            </Modal>
        </div>
    );
};

export default Playground;
