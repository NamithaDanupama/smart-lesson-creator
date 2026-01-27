import { useParams } from 'react-router-dom';
import LessonEditor from '@/components/lesson/LessonEditor';

const EditLesson = () => {
  const { id } = useParams<{ id: string }>();
  return <LessonEditor lessonId={id} />;
};

export default EditLesson;
