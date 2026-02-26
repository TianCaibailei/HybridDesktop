namespace HybridApp.WinForms;

partial class Form1
{
    /// <summary>
    ///  Required designer variable.
    /// </summary>
    private System.ComponentModel.IContainer components = null;

    /// <summary>
    ///  Clean up any resources being used.
    /// </summary>
    /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
    protected override void Dispose(bool disposing)
    {
        if (disposing && (components != null))
        {
            components.Dispose();
        }
        base.Dispose(disposing);
    }

    #region Windows Form Designer generated code

    /// <summary>
    ///  Required method for Designer support - do not modify
    ///  the contents of this method with the code editor.
    /// </summary>
    private void InitializeComponent()
    {
        components = new System.ComponentModel.Container();
        panel1 = new Panel();
        label1 = new Label();
        trackBarExposure = new TrackBar();
        webView = new Microsoft.Web.WebView2.WinForms.WebView2();
        timer1 = new System.Windows.Forms.Timer(components);
        propertyGridComplex = new System.Windows.Forms.PropertyGrid();
        btnAddLog = new System.Windows.Forms.Button();
        listBoxLogs = new System.Windows.Forms.ListBox();
        panel1.SuspendLayout();
        ((System.ComponentModel.ISupportInitialize)trackBarExposure).BeginInit();
        ((System.ComponentModel.ISupportInitialize)webView).BeginInit();
        SuspendLayout();
        // 
        // panel1
        // 
        panel1.Controls.Add(listBoxLogs);
        panel1.Controls.Add(btnAddLog);
        panel1.Controls.Add(propertyGridComplex);
        panel1.Controls.Add(label1);
        panel1.Controls.Add(trackBarExposure);
        panel1.Dock = DockStyle.Right;
        panel1.Location = new Point(560, 0);
        panel1.Name = "panel1";
        panel1.Size = new Size(240, 450);
        panel1.TabIndex = 1;
        // 
        // label1
        // 
        label1.AutoSize = true;
        label1.Location = new Point(23, 12);
        label1.Name = "label1";
        label1.Size = new Size(65, 17);
        label1.TabIndex = 1;
        label1.Text = "Exposure:";
        // 
        // trackBarExposure
        // 
        trackBarExposure.Location = new Point(94, 12);
        trackBarExposure.Maximum = 100;
        trackBarExposure.Name = "trackBarExposure";
        trackBarExposure.Size = new Size(134, 45);
        trackBarExposure.TabIndex = 0;
        trackBarExposure.Scroll += trackBarExposure_Scroll;
        // 
        // propertyGridComplex
        // 
        propertyGridComplex.Location = new Point(10, 80);
        propertyGridComplex.Name = "propertyGridComplex";
        propertyGridComplex.Size = new Size(220, 200);
        propertyGridComplex.TabIndex = 2;
        // 
        // btnAddLog
        // 
        btnAddLog.Location = new Point(10, 290);
        btnAddLog.Name = "btnAddLog";
        btnAddLog.Size = new Size(220, 30);
        btnAddLog.TabIndex = 3;
        btnAddLog.Text = "添加日志 (WinForm)";
        btnAddLog.UseVisualStyleBackColor = true;
        btnAddLog.Click += btnAddLog_Click;
        // 
        // listBoxLogs
        // 
        listBoxLogs.FormattingEnabled = true;
        listBoxLogs.ItemHeight = 17;
        listBoxLogs.Location = new Point(10, 330);
        listBoxLogs.Name = "listBoxLogs";
        listBoxLogs.Size = new Size(220, 100);
        listBoxLogs.TabIndex = 4;
        // 
        // webView
        // 
        webView.AllowExternalDrop = true;
        webView.CreationProperties = null;
        webView.DefaultBackgroundColor = Color.White;
        webView.Dock = DockStyle.Fill;
        webView.Location = new Point(0, 0);
        webView.Name = "webView";
        webView.Size = new Size(560, 450);
        webView.TabIndex = 2;
        webView.ZoomFactor = 1D;
        // 
        // timer1
        // 
        timer1.Tick += timer1_Tick;
        // 
        // Form1
        // 
        AutoScaleDimensions = new SizeF(7F, 17F);
        AutoScaleMode = AutoScaleMode.Font;
        ClientSize = new Size(800, 450);
        Controls.Add(webView);
        Controls.Add(panel1);
        Name = "Form1";
        Text = "Form1";
        Load += Form1_Load;
        panel1.ResumeLayout(false);
        panel1.PerformLayout();
        ((System.ComponentModel.ISupportInitialize)trackBarExposure).EndInit();
        ((System.ComponentModel.ISupportInitialize)webView).EndInit();
        ResumeLayout(false);
    }

    #endregion

    private Panel panel1;
    private Microsoft.Web.WebView2.WinForms.WebView2 webView;
    private TrackBar trackBarExposure;
    private Label label1;
    private System.Windows.Forms.Timer timer1;
    private System.Windows.Forms.PropertyGrid propertyGridComplex;
    private System.Windows.Forms.Button btnAddLog;
    private System.Windows.Forms.ListBox listBoxLogs;
}
