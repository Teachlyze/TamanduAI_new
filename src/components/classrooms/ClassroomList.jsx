import React from 'react';
import { List, Button, Tag, Card } from 'antd';
import { useNavigate } from 'react-router-dom';

const getClassroomTypeTag = (type) => {
  switch (type) {
    case 0: return <Tag color="blue">One-to-one</Tag>;
    case 2: return <Tag color="purple">Lecture Hall</Tag>;
    case 4: return <Tag color="green">Small Classroom</Tag>;
    case 10: return <Tag color="orange">Cloud Classroom</Tag>;
    default: return <Tag>Unknown</Tag>;
  }
};

const ClassroomList = ({ classrooms }) => {
  const navigate = useNavigate();

  const handleJoin = (roomUuid) => {
    // Navigate to the whiteboard page, which also handles the video call
    navigate(`/whiteboard/${roomUuid}`);
  };

  const handleViewDetails = (classroom) => {
    navigate(`/classrooms/${classroom.roomUuid}`, { state: { classroom } });
  };

  return (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
      dataSource={classrooms}
      renderItem={(classroom) => (
        <List.Item>
          <Card 
            title={classroom.roomName}
            actions={[
              <Button type="primary" onClick={() => handleJoin(classroom.roomUuid)}>
                Join
              </Button>,
              <Button onClick={() => handleViewDetails(classroom)}>
                Details
              </Button>
            ]}
          >
            <Card.Meta
              description={getClassroomTypeTag(classroom.roomType)}
            />
            <div className="mt-2 text-xs text-gray-500">
              ID: {classroom.roomUuid}
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
};

export default ClassroomList;
