using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace HybridApp.Core.ViewModels
{
    public abstract class SyncViewModelBase : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler? PropertyChanged;
        public string VmName { get; }
        private Action<string, string, object?>? _syncAction;

        protected SyncViewModelBase(string vmName)
        {
            VmName = vmName;
        }

        public void AttachSyncAction(Action<string, string, object?> syncAction)
        {
            _syncAction = syncAction;
        }

        protected void SetProperty<T>(ref T backingStore, T value, [CallerMemberName] string propertyName = "")
        {
            if (Equals(backingStore, value)) return;
            backingStore = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
            
            // Trigger sync callback
            _syncAction?.Invoke(VmName, propertyName, value); 
        }
    }
}
