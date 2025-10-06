import os
import json
import time
from datetime import datetime, timedelta

import dash
from dash import dcc, html, Input, Output, State
import dash_bootstrap_components as dbc
import plotly.graph_objs as go
import plotly.express as px
import pandas as pd
import redis
import psycopg2
from prometheus_client.parser import text_string_to_metric_families

# Initialize the Dash app
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
server = app.server

# Database connections
def get_redis_client():
    return redis.Redis.from_url(
        url=os.getenv('REDIS_URL', 'redis://localhost:6379'),
        decode_responses=True
    )

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('POSTGRES_HOST', 'localhost'),
        port=os.getenv('POSTGRES_PORT', '5432'),
        database=os.getenv('POSTGRES_DB', 'postgres'),
        user=os.getenv('POSTGRES_USER', 'postgres'),
        password=os.getenv('POSTGRES_PASSWORD', 'password')
    )

# Layout
app.layout = dbc.Container([
    dbc.NavbarSimple(
        brand="TamanduAI Dashboards",
        brand_href="#",
        color="primary",
        dark=True,
        className="mb-4"
    ),

    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("📊 Visão Geral"),
                dbc.CardBody([
                    html.H4("Sistema Online", className="card-title"),
                    html.P("Todos os serviços funcionando normalmente", className="card-text"),
                    dbc.Button("Atualizar Status", color="primary", id="refresh-status-btn")
                ])
            ], className="mb-3")
        ], width=3),

        dbc.Col([
            dbc.Card([
                dbc.CardHeader("🚀 Upstash Redis"),
                dbc.CardBody([
                    html.H2(id="redis-status", children="🔄"),
                    html.P("Status do Redis em nuvem")
                ])
            ], className="mb-3")
        ], width=3),

        dbc.Col([
            dbc.Card([
                dbc.CardHeader("👥 Usuários Ativos"),
                dbc.CardBody([
                    html.H2(id="active-users-count", children="0"),
                    html.P("Usuários online agora")
                ])
            ], className="mb-3")
        ], width=3),

        dbc.Col([
            dbc.Card([
                dbc.CardHeader("📈 Taxa de Sucesso"),
                dbc.CardBody([
                    html.H2(id="success-rate", children="0%"),
                    html.P("Últimas 24 horas")
                ])
            ], className="mb-3")
        ], width=3)
    ]),

    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("📊 Métricas de Performance"),
                dbc.CardBody([
                    dcc.Graph(id="performance-graph"),
                    dcc.Interval(
                        id='interval-component',
                        interval=30*1000,  # Update every 30 seconds
                        n_intervals=0
                    )
                ])
            ])
        ], width=8),

        dbc.Col([
            dbc.Card([
                dbc.CardHeader("📋 Logs Recentes"),
                dbc.CardBody([
                    html.Div(id="recent-logs", style={"height": "300px", "overflow-y": "scroll"}),
                    dbc.Button("Limpar Logs", color="secondary", size="sm", className="mt-2")
                ])
            ])
        ], width=4)
    ]),

    dbc.Row([
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("🛠️ Controles do Sistema"),
                dbc.CardBody([
                    dbc.Row([
                        dbc.Col([
                            dbc.Button("Health Check", color="success", className="me-2"),
                            dbc.Button("Backup Status", color="info", className="me-2"),
                            dbc.Button("Cache Status", color="warning")
                        ])
                    ]),
                    html.Div(id="system-status", className="mt-3")
                ])
            ])
        ])
    ])
], fluid=True)

# Callbacks
@app.callback(
    [Output('redis-status', 'children'),
     Output('active-users-count', 'children'),
     Output('success-rate', 'children')],
    [Input('interval-component', 'n_intervals')]
)
def update_metrics(n):
    try:
        # Get metrics from Upstash Redis
        redis_client = get_redis_client()

        # Test Redis connection
        try:
            redis_client.ping()
            redis_status = "✅ Online"
        except:
            redis_status = "❌ Offline"

        # Mock data for now - replace with actual metrics collection
        active_users = redis_client.scard('active_users') if redis_client.exists('active_users') else 0
        success_rate = 98.5  # Replace with actual calculation

        return redis_status, str(active_users), f"{success_rate:.1f}%"
    except Exception as e:
        return "❌ Error", "0", "0%"

@app.callback(
    Output('performance-graph', 'figure'),
    [Input('interval-component', 'n_intervals')]
)
def update_performance_graph(n):
    try:
        # Generate sample data for the graph
        times = pd.date_range(start=datetime.now() - timedelta(hours=1), periods=60, freq='T')

        # Mock performance data
        response_times = [200 + i*2 + (i % 10)*5 for i in range(60)]
        error_rates = [max(0, 5 - i*0.1 + (i % 15)) for i in range(60)]

        df = pd.DataFrame({
            'timestamp': times,
            'response_time': response_times,
            'error_rate': error_rates
        })

        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=df['timestamp'],
            y=df['response_time'],
            mode='lines',
            name='Response Time (ms)',
            line=dict(color='blue')
        ))
        fig.add_trace(go.Scatter(
            x=df['timestamp'],
            y=df['error_rate'],
            mode='lines',
            name='Error Rate (%)',
            line=dict(color='red')
        ))

        fig.update_layout(
            title='Performance Metrics (Last Hour)',
            xaxis_title='Time',
            yaxis_title='Value',
            height=300
        )

        return fig
    except Exception as e:
        return go.Figure()

@app.callback(
    Output('recent-logs', 'children'),
    [Input('interval-component', 'n_intervals')]
)
def update_logs(n):
    try:
        # Mock logs - replace with actual log aggregation
        logs = [
            "2024-01-05 12:00:00 - User login successful",
            "2024-01-05 12:01:23 - Activity submission received",
            "2024-01-05 12:02:45 - Database backup completed",
            "2024-01-05 12:03:12 - Cache cleared successfully",
            "2024-01-05 12:04:33 - New user registration"
        ]

        log_items = []
        for log in logs:
            log_items.append(html.Div([
                html.Small(log, className="text-muted d-block")
            ]))

        return log_items
    except Exception as e:
        return [html.Div("Error loading logs")]

@app.callback(
    Output('system-status', 'children'),
    [Input('refresh-status-btn', 'n_clicks')]
)
def update_system_status(n):
    try:
        # Check system health
        redis_client = get_redis_client()
        db_conn = get_db_connection()

        status_items = []

        # Redis status
        try:
            redis_client.ping()
            status_items.append(html.Div([
                html.Small("✅ Upstash Redis: Online", className="text-success d-block")
            ]))
        except:
            status_items.append(html.Div([
                html.Small("❌ Upstash Redis: Offline", className="text-danger d-block")
            ]))

        # Database status
        try:
            with db_conn.cursor() as cur:
                cur.execute("SELECT 1")
            status_items.append(html.Div([
                html.Small("✅ Database: Online", className="text-success d-block")
            ]))
            db_conn.close()
        except:
            status_items.append(html.Div([
                html.Small("❌ Database: Offline", className="text-danger d-block")
            ]))

        return status_items
    except Exception as e:
        return [html.Div(f"Error checking status: {str(e)}")]

if __name__ == '__main__':
    port = int(os.getenv('DASHBOARD_PORT', 8050))
    app.run_server(host='0.0.0.0', port=port, debug=False)
