namespace IndustrialMonitor;

partial class MainForm
{
    private System.ComponentModel.IContainer components = null;
    private Microsoft.Web.WebView2.WinForms.WebView2 webView;
    private System.Windows.Forms.Panel panelControl;
    private System.Windows.Forms.Button btnLoadNc;
    private System.Windows.Forms.Button btnRotateFwd;
    private System.Windows.Forms.Button btnRotateRev;
    private System.Windows.Forms.Button btnAddInput;
    private System.Windows.Forms.Button btnAddOutput;
    private System.Windows.Forms.Label lblControls;

    protected override void Dispose(bool disposing)
    {
        if (disposing && (components != null))
        {
            components.Dispose();
        }
        base.Dispose(disposing);
    }

    private void InitializeComponent()
    {
        webView = new Microsoft.Web.WebView2.WinForms.WebView2();
        panelControl = new Panel();
        btnAddOutput = new Button();
        btnAddInput = new Button();
        btnRotateRev = new Button();
        btnRotateFwd = new Button();
        btnLoadNc = new Button();
        lblControls = new Label();
        button1 = new Button();
        button2 = new Button();
        button3 = new Button();
        button4 = new Button();
        ((System.ComponentModel.ISupportInitialize)webView).BeginInit();
        panelControl.SuspendLayout();
        SuspendLayout();
        // 
        // webView
        // 
        webView.AllowExternalDrop = true;
        webView.CreationProperties = null;
        webView.DefaultBackgroundColor = Color.FromArgb(15, 23, 42);
        webView.Dock = DockStyle.Fill;
        webView.Location = new Point(0, 0);
        webView.Name = "webView";
        webView.Size = new Size(1400, 1020);
        webView.TabIndex = 0;
        webView.ZoomFactor = 1D;
        // 
        // panelControl
        // 
        panelControl.BackColor = Color.FromArgb(30, 41, 59);
        panelControl.Controls.Add(button4);
        panelControl.Controls.Add(button3);
        panelControl.Controls.Add(button2);
        panelControl.Controls.Add(button1);
        panelControl.Controls.Add(btnAddOutput);
        panelControl.Controls.Add(btnAddInput);
        panelControl.Controls.Add(btnRotateRev);
        panelControl.Controls.Add(btnRotateFwd);
        panelControl.Controls.Add(btnLoadNc);
        panelControl.Controls.Add(lblControls);
        panelControl.Dock = DockStyle.Right;
        panelControl.Location = new Point(1400, 0);
        panelControl.Name = "panelControl";
        panelControl.Size = new Size(200, 1020);
        panelControl.TabIndex = 1;
        // 
        // btnAddOutput
        // 
        btnAddOutput.Location = new Point(20, 340);
        btnAddOutput.Name = "btnAddOutput";
        btnAddOutput.Size = new Size(160, 45);
        btnAddOutput.TabIndex = 5;
        btnAddOutput.Text = "模拟产出 (+10)";
        btnAddOutput.UseVisualStyleBackColor = true;
        btnAddOutput.Click += btnAddOutput_Click;
        // 
        // btnAddInput
        // 
        btnAddInput.Location = new Point(20, 272);
        btnAddInput.Name = "btnAddInput";
        btnAddInput.Size = new Size(160, 45);
        btnAddInput.TabIndex = 4;
        btnAddInput.Text = "模拟投入 (+10)";
        btnAddInput.UseVisualStyleBackColor = true;
        btnAddInput.Click += btnAddInput_Click;
        // 
        // btnRotateRev
        // 
        btnRotateRev.Location = new Point(20, 204);
        btnRotateRev.Name = "btnRotateRev";
        btnRotateRev.Size = new Size(160, 45);
        btnRotateRev.TabIndex = 3;
        btnRotateRev.Text = "转盘反转 (-1)";
        btnRotateRev.UseVisualStyleBackColor = true;
        btnRotateRev.Click += btnRotateRev_Click;
        // 
        // btnRotateFwd
        // 
        btnRotateFwd.Location = new Point(20, 136);
        btnRotateFwd.Name = "btnRotateFwd";
        btnRotateFwd.Size = new Size(160, 45);
        btnRotateFwd.TabIndex = 2;
        btnRotateFwd.Text = "转盘正转 (+1)";
        btnRotateFwd.UseVisualStyleBackColor = true;
        btnRotateFwd.Click += btnRotateFwd_Click;
        // 
        // btnLoadNc
        // 
        btnLoadNc.Location = new Point(20, 68);
        btnLoadNc.Name = "btnLoadNc";
        btnLoadNc.Size = new Size(160, 45);
        btnLoadNc.TabIndex = 1;
        btnLoadNc.Text = "加载外部 NC 文件";
        btnLoadNc.UseVisualStyleBackColor = true;
        btnLoadNc.Click += btnLoadNc_Click;
        // 
        // lblControls
        // 
        lblControls.AutoSize = true;
        lblControls.Font = new Font("Segoe UI", 12F, FontStyle.Bold);
        lblControls.ForeColor = Color.White;
        lblControls.Location = new Point(16, 23);
        lblControls.Name = "lblControls";
        lblControls.Size = new Size(123, 21);
        lblControls.TabIndex = 0;
        lblControls.Text = "C# 后端控制台";
        // 
        // button1
        // 
        button1.Location = new Point(20, 409);
        button1.Name = "button1";
        button1.Size = new Size(160, 45);
        button1.TabIndex = 5;
        button1.Text = "模拟报警";
        button1.UseVisualStyleBackColor = true;
        button1.Click += btnAlarm_Click;
        // 
        // button2
        // 
        button2.Location = new Point(20, 460);
        button2.Name = "button2";
        button2.Size = new Size(160, 45);
        button2.TabIndex = 5;
        button2.Text = "清除报警";
        button2.UseVisualStyleBackColor = true;
        button2.Click += btnClearAlarm_Click;
        // 
        // button3
        // 
        button3.Location = new Point(20, 523);
        button3.Name = "button3";
        button3.Size = new Size(160, 45);
        button3.TabIndex = 5;
        button3.Text = "模拟提醒";
        button3.UseVisualStyleBackColor = true;
        button3.Click += btnInfo_Click;
        // 
        // button4
        // 
        button4.Location = new Point(20, 574);
        button4.Name = "button4";
        button4.Size = new Size(160, 45);
        button4.TabIndex = 5;
        button4.Text = "清除提醒";
        button4.UseVisualStyleBackColor = true;
        button4.Click += btnClearInfo_Click;
        // 
        // MainForm
        // 
        AutoScaleDimensions = new SizeF(7F, 17F);
        AutoScaleMode = AutoScaleMode.Font;
        BackColor = Color.FromArgb(15, 23, 42);
        ClientSize = new Size(1600, 1020);
        Controls.Add(webView);
        Controls.Add(panelControl);
        Name = "MainForm";
        StartPosition = FormStartPosition.CenterScreen;
        Text = "工业监控面板 - Industrial Monitor";
        WindowState = FormWindowState.Maximized;
        Load += MainForm_Load;
        ((System.ComponentModel.ISupportInitialize)webView).EndInit();
        panelControl.ResumeLayout(false);
        panelControl.PerformLayout();
        ResumeLayout(false);
    }
    private Button button4;
    private Button button3;
    private Button button2;
    private Button button1;
}
