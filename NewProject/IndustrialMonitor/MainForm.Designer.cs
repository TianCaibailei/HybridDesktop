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
        this.webView = new Microsoft.Web.WebView2.WinForms.WebView2();
        this.panelControl = new System.Windows.Forms.Panel();
        this.lblControls = new System.Windows.Forms.Label();
        this.btnLoadNc = new System.Windows.Forms.Button();
        this.btnRotateFwd = new System.Windows.Forms.Button();
        this.btnRotateRev = new System.Windows.Forms.Button();
        this.btnAddInput = new System.Windows.Forms.Button();
        this.btnAddOutput = new System.Windows.Forms.Button();
        ((System.ComponentModel.ISupportInitialize)(this.webView)).BeginInit();
        this.panelControl.SuspendLayout();
        this.SuspendLayout();
        
        // 
        // webView
        // 
        this.webView.AllowExternalDrop = true;
        this.webView.CreationProperties = null;
        this.webView.DefaultBackgroundColor = System.Drawing.Color.FromArgb(15, 23, 42);
        this.webView.Dock = System.Windows.Forms.DockStyle.Fill;
        this.webView.Location = new System.Drawing.Point(0, 0);
        this.webView.Name = "webView";
        this.webView.Size = new System.Drawing.Size(1400, 900);
        this.webView.TabIndex = 0;
        this.webView.ZoomFactor = 1D;
        
        // 
        // panelControl
        // 
        this.panelControl.BackColor = System.Drawing.Color.FromArgb(30, 41, 59);
        this.panelControl.Controls.Add(this.btnAddOutput);
        this.panelControl.Controls.Add(this.btnAddInput);
        this.panelControl.Controls.Add(this.btnRotateRev);
        this.panelControl.Controls.Add(this.btnRotateFwd);
        this.panelControl.Controls.Add(this.btnLoadNc);
        this.panelControl.Controls.Add(this.lblControls);
        this.panelControl.Dock = System.Windows.Forms.DockStyle.Right;
        this.panelControl.Location = new System.Drawing.Point(1400, 0);
        this.panelControl.Name = "panelControl";
        this.panelControl.Size = new System.Drawing.Size(200, 900);
        this.panelControl.TabIndex = 1;
        
        // 
        // lblControls
        // 
        this.lblControls.AutoSize = true;
        this.lblControls.Font = new System.Drawing.Font("Segoe UI", 12F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point);
        this.lblControls.ForeColor = System.Drawing.Color.White;
        this.lblControls.Location = new System.Drawing.Point(16, 20);
        this.lblControls.Name = "lblControls";
        this.lblControls.Size = new System.Drawing.Size(116, 21);
        this.lblControls.TabIndex = 0;
        this.lblControls.Text = "C# 后端控制台";
        
        // 
        // btnLoadNc
        // 
        this.btnLoadNc.Location = new System.Drawing.Point(20, 60);
        this.btnLoadNc.Name = "btnLoadNc";
        this.btnLoadNc.Size = new System.Drawing.Size(160, 40);
        this.btnLoadNc.TabIndex = 1;
        this.btnLoadNc.Text = "加载外部 NC 文件";
        this.btnLoadNc.UseVisualStyleBackColor = true;
        this.btnLoadNc.Click += new System.EventHandler(this.btnLoadNc_Click);
        
        // 
        // btnRotateFwd
        // 
        this.btnRotateFwd.Location = new System.Drawing.Point(20, 120);
        this.btnRotateFwd.Name = "btnRotateFwd";
        this.btnRotateFwd.Size = new System.Drawing.Size(160, 40);
        this.btnRotateFwd.TabIndex = 2;
        this.btnRotateFwd.Text = "转盘正转 (+1)";
        this.btnRotateFwd.UseVisualStyleBackColor = true;
        this.btnRotateFwd.Click += new System.EventHandler(this.btnRotateFwd_Click);
        
        // 
        // btnRotateRev
        // 
        this.btnRotateRev.Location = new System.Drawing.Point(20, 180);
        this.btnRotateRev.Name = "btnRotateRev";
        this.btnRotateRev.Size = new System.Drawing.Size(160, 40);
        this.btnRotateRev.TabIndex = 3;
        this.btnRotateRev.Text = "转盘反转 (-1)";
        this.btnRotateRev.UseVisualStyleBackColor = true;
        this.btnRotateRev.Click += new System.EventHandler(this.btnRotateRev_Click);
        
        // 
        // btnAddInput
        // 
        this.btnAddInput.Location = new System.Drawing.Point(20, 240);
        this.btnAddInput.Name = "btnAddInput";
        this.btnAddInput.Size = new System.Drawing.Size(160, 40);
        this.btnAddInput.TabIndex = 4;
        this.btnAddInput.Text = "模拟投入 (+10)";
        this.btnAddInput.UseVisualStyleBackColor = true;
        this.btnAddInput.Click += new System.EventHandler(this.btnAddInput_Click);
        
        // 
        // btnAddOutput
        // 
        this.btnAddOutput.Location = new System.Drawing.Point(20, 300);
        this.btnAddOutput.Name = "btnAddOutput";
        this.btnAddOutput.Size = new System.Drawing.Size(160, 40);
        this.btnAddOutput.TabIndex = 5;
        this.btnAddOutput.Text = "模拟产出 (+10)";
        this.btnAddOutput.UseVisualStyleBackColor = true;
        this.btnAddOutput.Click += new System.EventHandler(this.btnAddOutput_Click);
        
        // 
        // MainForm
        // 
        this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
        this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
        this.BackColor = System.Drawing.Color.FromArgb(15, 23, 42);
        this.ClientSize = new System.Drawing.Size(1600, 900);
        this.Controls.Add(this.webView);
        this.Controls.Add(this.panelControl);
        this.Name = "MainForm";
        this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
        this.Text = "工业监控面板 - Industrial Monitor";
        this.WindowState = System.Windows.Forms.FormWindowState.Maximized;
        this.Load += new System.EventHandler(this.MainForm_Load);
        ((System.ComponentModel.ISupportInitialize)(this.webView)).EndInit();
        this.panelControl.ResumeLayout(false);
        this.panelControl.PerformLayout();
        this.ResumeLayout(false);
    }
}
