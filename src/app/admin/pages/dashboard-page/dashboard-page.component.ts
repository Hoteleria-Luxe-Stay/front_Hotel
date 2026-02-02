import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats } from '../../../services/dashboard.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  standalone: true,
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Referencias a los canvas de los gráficos
  @ViewChild('reservasChart') reservasChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('ingresosChart') ingresosChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('estadoChart') estadoChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hotelesDepChart') hotelesDepChartRef!: ElementRef<HTMLCanvasElement>;

  // Instancias de los gráficos
  private reservasChart: Chart | null = null;
  private ingresosChart: Chart | null = null;
  private estadoChart: Chart | null = null;
  private hotelesDepChart: any = null;

  // Intervalo para actualización automática
  private refreshInterval: any;

  ngOnInit(): void {
    this.loadStats();
    // Actualizar cada 30 segundos
    this.refreshInterval = setInterval(() => this.loadStats(), 30000);
  }

  ngAfterViewInit(): void {
    // Los gráficos se crearán después de que los datos se carguen
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.destroyCharts();
  }

  loadStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
        this.error.set(null);
        // Esperar al siguiente ciclo para que el DOM esté listo
        setTimeout(() => this.createCharts(), 0);
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        this.error.set('Error al cargar las estadísticas');
        this.loading.set(false);
      },
    });
  }

  private destroyCharts(): void {
    if (this.reservasChart) {
      this.reservasChart.destroy();
      this.reservasChart = null;
    }
    if (this.ingresosChart) {
      this.ingresosChart.destroy();
      this.ingresosChart = null;
    }
    if (this.estadoChart) {
      this.estadoChart.destroy();
      this.estadoChart = null;
    }
    if (this.hotelesDepChart) {
      this.hotelesDepChart.destroy();
      this.hotelesDepChart = null;
    }
  }

  private createCharts(): void {
    const data = this.stats();
    if (!data) return;

    this.destroyCharts();

    // Gráfico de Reservas por Mes (Línea)
    if (this.reservasChartRef?.nativeElement) {
      const ctx = this.reservasChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.reservasChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: Object.keys(data.reservasPorMes),
            datasets: [
              {
                label: 'Reservas',
                data: Object.values(data.reservasPorMes),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3B82F6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
              },
            },
          },
        });
      }
    }

    // Gráfico de Ingresos por Mes (Barras)
    if (this.ingresosChartRef?.nativeElement) {
      const ctx = this.ingresosChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.ingresosChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(data.ingresosPorMes),
            datasets: [
              {
                label: 'Ingresos (S/.)',
                data: Object.values(data.ingresosPorMes),
                backgroundColor: [
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(245, 158, 11, 0.8)',
                  'rgba(139, 92, 246, 0.8)',
                  'rgba(236, 72, 153, 0.8)',
                  'rgba(6, 182, 212, 0.8)',
                ],
                borderRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => 'S/. ' + value,
                },
              },
            },
          },
        });
      }
    }

    // Gráfico de Estado de Reservas (Dona)
    if (this.estadoChartRef?.nativeElement) {
      const ctx = this.estadoChartRef.nativeElement.getContext('2d');
      if (ctx) {
        this.estadoChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Confirmadas', 'Canceladas'],
            datasets: [
              {
                data: [
                  data.reservasPorEstado['CONFIRMADA'] || 0,
                  data.reservasPorEstado['CANCELADA'] || 0,
                ],
                backgroundColor: ['#10B981', '#EF4444'],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { padding: 20 },
              },
            },
            cutout: '70%',
          },
        });
      }
    }

    // Gráfico de Hoteles por Departamento (Barras horizontales)
    if (this.hotelesDepChartRef?.nativeElement) {
      const ctx = this.hotelesDepChartRef.nativeElement.getContext('2d');
      if (ctx) {
        // Mostrar TODOS los departamentos ordenados por cantidad (mayor a menor)
        // Incluye departamentos con 0 hoteles
        const sortedEntries = Object.entries(data.hotelesPorDepartamento).sort(
          (a: [string, number], b: [string, number]) => b[1] - a[1]
        );

        this.hotelesDepChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: sortedEntries.map((e) => e[0]),
            datasets: [
              {
                label: 'Hoteles',
                data: sortedEntries.map((e) => e[1]),
                backgroundColor: 'rgba(245, 158, 11, 0.8)',
                borderRadius: 8,
              },
            ],
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
              },
            },
          },
        });
      }
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  }

  getEstadoClass(estado: string): string {
    return estado === 'CONFIRMADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getDepartamentosChartHeight(): number {
    const data = this.stats();
    if (!data || !data.hotelesPorDepartamento) {
      return 288; // altura por defecto (h-72 = 18rem = 288px)
    }
    const numDepartamentos = Object.keys(data.hotelesPorDepartamento).length;
    // Mínimo 288px, 40px por cada departamento
    return Math.max(288, numDepartamentos * 40);
  }
}
