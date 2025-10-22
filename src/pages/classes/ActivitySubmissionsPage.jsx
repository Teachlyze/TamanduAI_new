import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Table, Tag, Typography, Space, Button } from 'antd';
import { supabase } from '@/lib/supabaseClient';
import { getPlagiarismChecksForActivity } from '@/services/plagiarismService';

const { Title, Text } = Typography;

function severityTag(percent) {
  const sev = percent > 50 ? 'gravissimo' : percent > 35 ? 'grave' : percent > 20 ? 'medio' : 'none';
  const color = sev === 'gravissimo' ? 'red' : sev === 'grave' ? 'orange' : sev === 'medio' ? 'gold' : 'default';
  const label = sev === 'gravissimo' ? `Gravíssimo ${percent}%` : sev === 'grave' ? `Grave ${percent}%` : sev === 'medio' ? `Médio ${percent}%` : 'OK';
  return <Tag color={color}>{label}</Tag>;
}

export default function ActivitySubmissionsPage() {
  const { classId, activityId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [checksBySubmission, setChecksBySubmission] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data: subs, error } = await supabase
          .from('submissions')
          .select('id, user_id, status, submitted_at, users:profiles(id, full_name)')
          .eq('activity_id', activityId)
          .order('submitted_at', { ascending: false });
        if (error) throw error;
        setSubmissions(subs || []);

        const checks = await getPlagiarismChecksForActivity(activityId);
        const latest = {};
        (checks || []).forEach((c) => {
          const sid = c.submission_id;
          const prev = latest[sid];
          const ts = new Date(c.created_at || c.updated_at || 0).getTime();
          const prevTs = prev ? new Date(prev.created_at || prev.updated_at || 0).getTime() : -1;
          if (!prev || ts > prevTs) latest[sid] = c;
        });
        setChecksBySubmission(latest);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activityId]);

  const columns = useMemo(() => [
    {
      title: 'Aluno',
      dataIndex: ['users', 'full_name'],
      key: 'student',
      render: (name, record) => name || record.user_id,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (st) => <Tag color={st === 'submitted' ? 'blue' : 'default'}>{st}</Tag>,
    },
    {
      title: 'Enviado em',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (d) => (d ? new Date(d).toLocaleString('pt-BR') : '—'),
    },
    {
      title: 'Plágio',
      key: 'plagiarism',
      render: (_, rec) => {
        const chk = checksBySubmission[rec.id];
        if (!chk) return <Tag>—</Tag>;
        const percent = typeof chk.plag_percent === 'number' ? chk.plag_percent : Math.round((chk.similarity_score || 0) * 100);
        return severityTag(percent);
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, rec) => (
        <Space>
          <Button size="small" type="link">Corrigir</Button>
          <Button size="small">Detalhes</Button>
        </Space>
      ),
    },
  ], [checksBySubmission]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={3} style={{ margin: 0 }}>Entregas da Atividade</Title>
        <Link to={`/dashboard/classes/${classId}/activities/${activityId}`}>Voltar</Link>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={(submissions || []).map((s) => ({ key: s.id, ...s }))}
        pagination={{ pageSize: 10 }}
        size="middle"
      />
    </div>
  );
}
